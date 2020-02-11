// @flow
import NODE from "../utils/nodes";
import HegelError from "../utils/errors";
import { Type } from "../type-graph/types/type";
import { TypeVar } from "../type-graph/types/type-var";
import { TypeScope } from "../type-graph/type-scope";
import { UnionType } from "../type-graph/types/union-type";
import { ObjectType } from "../type-graph/types/object-type";
import { VariableInfo } from "../type-graph/variable-info";
import { VariableScope } from "../type-graph/variable-scope";
import { CollectionType } from "../type-graph/types/collection-type";
import { getMemberExressionTarget } from "../utils/common";
import {
  getPropertyChaining,
  getTypesFromVariants
} from "../utils/inference-utils";
import { createObjectWith, mergeObjectsTypes } from "../utils/type-utils";
import type { ModuleScope } from "../type-graph/module-scope";
import type {
  Node,
  Identifier,
  NullLiteral,
  BigIntLiteral,
  StringLiteral,
  NumericLiteral,
  BooleanLiteral,
  MemberExpression
} from "@babel/parser";

function isIdentifierOrProperty(node: Node) {
  return (
    (node.type === NODE.IDENTIFIER && node.name !== "undefined") ||
    node.type === NODE.MEMBER_EXPRESSION
  );
}

function getEqualsArguments(
  left: Node,
  right: Node,
  refinementNode: Node
): ?{ target: Node, value: Node } {
  if (
    (refinementNode.type !== NODE.SWITCH_CASE ||
      right === null ||
      left === null) &&
    (refinementNode.type !== NODE.BINARY_EXPRESSION ||
      !["===", "==", "!==", "!="].includes(refinementNode.operator))
  ) {
    return;
  }
  let target: ?Node = null;
  if (isIdentifierOrProperty(left)) {
    target = left;
  } else if (isIdentifierOrProperty(right)) {
    target = right;
  }
  let value: ?Node = null;
  if (isSimpleLiteral(left)) {
    value = left;
  } else if (isSimpleLiteral(right)) {
    value = right;
  }
  if (!target || !value) {
    return null;
  }
  return { value, target };
}

function isStrict(refinementNode: Node) {
  if (refinementNode.type === NODE.SWITCH_CASE) {
    return true;
  }
  switch (refinementNode.operator) {
    case "===":
    case "!==":
      return true;
    case "==":
    case "!=":
      return false;
  }
  throw new Error("Never!");
}

function isSimpleLiteral(node: Node) {
  return (
    node.type === NODE.NULL_LITERAL ||
    node.type === NODE.NUMERIC_LITERAL ||
    node.type === NODE.BIGINT_LITERAL ||
    node.type === NODE.STRING_LITERAL ||
    node.type === NODE.BOOLEAN_LITERAL ||
    (node.type === NODE.IDENTIFIER && node.name === "undefined")
  );
}

function getRefinmentType(
  value:
    | Identifier
    | NullLiteral
    | NumericLiteral
    | BigIntLiteral
    | StringLiteral
    | BooleanLiteral,
  refinementNode: Node
): Type {
  const UNION = UnionType.term("undefined | null", {}, [
    Type.Undefined,
    Type.Null
  ]);
  const strict = isStrict(refinementNode);
  switch (value.type) {
    case NODE.NUMERIC_LITERAL:
      return Type.term(value.value, {
        isSubtypeOf: Type.Number
      });
    case NODE.BIGINT_LITERAL:
      return Type.term(`${value.value}n`, {
        isSubtypeOf: Type.BigInt
      });
    case NODE.STRING_LITERAL:
      return Type.term(`'${value.value}'`, {
        isSubtypeOf: Type.String
      });
    case NODE.BOOLEAN_LITERAL:
      return Type.term(value.value, {
        isSubtypeOf: Type.Boolean
      });
    case NODE.NULL_LITERAL:
      return strict ? Type.Null : UNION;
  }
  if (value.type === NODE.IDENTIFIER && value.name === "undefined") {
    return strict ? Type.Undefined : UNION;
  }
  throw new Error("Never!");
}

function refinementVariants(
  [refinementedVariants, alternateVariants]: [Array<Type>, Array<Type>],
  variant: Type,
  refinementType: Type
): [Array<Type>, Array<Type>] {
  if (refinementType.isPrincipalTypeFor(variant)) {
    return [refinementedVariants.concat([variant]), alternateVariants];
  }
  if (variant.isSuperTypeFor(refinementType)) {
    return [
      refinementedVariants.concat([refinementType]),
      alternateVariants.concat([variant])
    ];
  }
  return [refinementedVariants, alternateVariants.concat([variant])];
}

function equalsIdentifier(
  node: Identifier,
  currentScope: VariableScope | ModuleScope,
  typeScope: TypeScope,
  value: Identifier | NullLiteral,
  refinementNode: Node
): [string, Type, Type] {
  const variableName = node.name;
  const refinementType = getRefinmentType(value, refinementNode);
  const variableInfo = currentScope.findVariable(node);
  const [refinementedVariants, alternateVariants] =
    variableInfo.type instanceof UnionType
      ? variableInfo.type.variants.reduce(
          (res, variant) => refinementVariants(res, variant, refinementType),
          [[], []]
        )
      : refinementVariants([[], []], variableInfo.type, refinementType);
  if (
    !(variableInfo.type instanceof TypeVar) &&
    variableInfo.type !== Type.Unknown &&
    refinementedVariants.length === 0
  ) {
    throw new HegelError(
      `Type ${String(variableInfo.type.name)} can't be "${String(
        refinementType.name
      )}" type`,
      refinementNode.loc
    );
  }
  let refinementedType;
  let alternateType;
  if (variableInfo.type instanceof UnionType) {
    refinementedType = UnionType.term(null, {}, refinementedVariants);
    alternateType = UnionType.term(null, {}, alternateVariants);
  } else {
    refinementedType = refinementType;
    alternateType = variableInfo.type;
  }
  return [variableName, refinementedType, alternateType];
}

export function refinePropertyWithConstraint(
  chaining: Array<string>,
  refinementType: Type,
  variableType: Type,
  typeScope: TypeScope
): [?Type, ?Type] {
  const refinementedType: Type = chaining.reduceRight((res: Type, property) => {
    const propertiesForObjectType = [[property, new VariableInfo(res)]];
    return ObjectType.term(
      ObjectType.getName(propertiesForObjectType),
      {},
      propertiesForObjectType
    );
  }, refinementType);
  return [refinementedType, variableType];
}

function propertyWith(
  propertyName: string,
  propertyType: ?Type,
  propertyOwner: ObjectType,
  typeScope: TypeScope
) {
  if (propertyType == undefined) {
    return propertyType;
  }
  const newPropertyOwner = createObjectWith(
    propertyName,
    propertyType,
    typeScope
  );
  return mergeObjectsTypes(propertyOwner, newPropertyOwner, typeScope);
}

export function refinementProperty(
  variableName: string,
  variableType: Type,
  refinementType: Type,
  refinementNode: Node,
  currentPropertyNameIndex: number,
  chainingProperties: Array<string>,
  typeScope: TypeScope,
  destructUnion: boolean = false
): ?[?Type, ?Type] {
  const currentPropertyName = chainingProperties[currentPropertyNameIndex];
  const isLast = currentPropertyNameIndex === chainingProperties.length - 1;
  if (variableType instanceof TypeVar || variableType === Type.Unknown) {
    if (
      !(variableType instanceof TypeVar) ||
      variableType.constraint === undefined
    ) {
      return refinePropertyWithConstraint(
        chainingProperties.slice(currentPropertyNameIndex),
        refinementType,
        variableType,
        typeScope
      );
    }
    variableType = variableType.constraint;
  }
  if (isLast && variableType instanceof CollectionType) {
    return;
  }
  if (variableType instanceof ObjectType) {
    const property = variableType.getPropertyType(currentPropertyName);
    if (property == null) {
      return;
    }
    if (isLast) {
      if (property instanceof UnionType) {
        const [
          refinementedVariants,
          alternateVariants
        ] = property.variants.reduce(
          (res, variant) => refinementVariants(res, variant, refinementType),
          [[], []]
        );
        const [refinemented, alternate] = getTypesFromVariants(
          // $FlowIssue
          refinementedVariants,
          // $FlowIssue
          alternateVariants,
          typeScope
        );
        return [
          propertyWith(
            currentPropertyName,
            refinemented,
            variableType,
            typeScope
          ),
          propertyWith(currentPropertyName, alternate, variableType, typeScope)
        ];
      }
      if (refinementType.isPrincipalTypeFor(property)) {
        return [variableType, undefined];
      }
      if (property.isPrincipalTypeFor(refinementType)) {
        return [
          propertyWith(
            currentPropertyName,
            refinementType,
            variableType,
            typeScope
          ),
          variableType
        ];
      }
      if (destructUnion && refinementType instanceof UnionType) {
        const pickedVariants = refinementType.variants.filter(variant =>
          property.isPrincipalTypeFor(variant)
        );
        return [
          propertyWith(
            currentPropertyName,
            UnionType.term(null, {}, pickedVariants),
            variableType,
            typeScope
          ),
          variableType
        ];
      }
      return [undefined, variableType];
    }
    const nextIndex = currentPropertyNameIndex + 1;
    const nestedRefinement = refinementProperty(
      variableName,
      property,
      refinementType,
      refinementNode,
      nextIndex,
      chainingProperties,
      typeScope
    );
    if (!nestedRefinement) {
      return;
    }
    return [
      propertyWith(
        currentPropertyName,
        nestedRefinement[0],
        variableType,
        typeScope
      ),
      propertyWith(
        currentPropertyName,
        nestedRefinement[1],
        variableType,
        typeScope
      )
    ];
  }
  if (variableType instanceof UnionType) {
    const [
      refinementedVariants,
      alternateVariants
    ] = variableType.variants.reduce(
      ([refinementedVariants, alternateVariants], variant) => {
        const isNotAlternateVariant =
          variant instanceof ObjectType &&
          variant.getPropertyType(currentPropertyName);
        const refinementedTypeAndAlternateType = isNotAlternateVariant
          ? refinementProperty(
              variableName,
              variant,
              refinementType,
              refinementNode,
              currentPropertyNameIndex,
              chainingProperties,
              typeScope
            )
          : undefined;
        if (!refinementedTypeAndAlternateType) {
          return [refinementedVariants, alternateVariants.concat([variant])];
        }
        const [
          refinementedType,
          alternateType
        ] = refinementedTypeAndAlternateType;
        return [
          refinementedType
            ? refinementedVariants.concat([refinementedType])
            : refinementedVariants,
          alternateType
            ? alternateVariants.concat([alternateType])
            : alternateVariants
        ];
      },
      [[], []]
    );
    return getTypesFromVariants(
      refinementedVariants,
      alternateVariants,
      typeScope
    );
  }
}

function equalsProperty(
  node: MemberExpression,
  currentScope: VariableScope | ModuleScope,
  typeScope: TypeScope,
  value: Identifier | NullLiteral,
  refinementNode: Node
): ?[string, Type, Type] {
  const targetObject = getMemberExressionTarget(node);
  if (targetObject.type !== NODE.IDENTIFIER) {
    return;
  }
  const variableName = targetObject.name;
  const propertiesChaining = getPropertyChaining(node);
  const refinementType = getRefinmentType(value, refinementNode);
  const targetVariableInfo = currentScope.findVariable(targetObject);
  if (
    !variableName ||
    !targetVariableInfo ||
    !propertiesChaining ||
    targetVariableInfo instanceof VariableScope
  ) {
    return;
  }
  const refinmentedAndAlternate = refinementProperty(
    variableName,
    targetVariableInfo.type,
    refinementType,
    refinementNode,
    0,
    propertiesChaining,
    typeScope
  );
  if (refinmentedAndAlternate == undefined) {
    return;
  }
  if (
    refinmentedAndAlternate[0] == undefined ||
    refinmentedAndAlternate[1] == undefined
  ) {
    const typeName = String(refinementType.name);
    throw new HegelError(
      `Property can't be "${typeName}" type or always have type "${typeName}"`,
      refinementNode.loc
    );
  }
  return [variableName, refinmentedAndAlternate[0], refinmentedAndAlternate[1]];
}
export function equalsRefinement(
  currentRefinementNode: Node,
  currentScope: VariableScope | ModuleScope,
  typeScope: TypeScope,
  moduleScope: ModuleScope
): ?[string, Type, Type] {
  const isSwitch = currentRefinementNode.type === NODE.SWITCH_CASE;
  const args = getEqualsArguments(
    isSwitch
      ? currentRefinementNode.parent.discriminant
      : currentRefinementNode.left,
    isSwitch ? currentRefinementNode.test : currentRefinementNode.right,
    currentRefinementNode
  );
  if (!args) {
    return;
  }
  const { target, value } = args;
  let refinementedType, alternateType, name;
  if (target.type === NODE.IDENTIFIER) {
    [name, refinementedType, alternateType] = equalsIdentifier(
      target,
      currentScope,
      typeScope,
      value,
      currentRefinementNode
    );
  }
  if (target.type === NODE.MEMBER_EXPRESSION) {
    const result = equalsProperty(
      target,
      currentScope,
      typeScope,
      value,
      currentRefinementNode
    );
    if (!result) {
      return;
    }
    [name, refinementedType, alternateType] = result;
  }
  if (refinementedType) {
    if (
      currentRefinementNode.operator === "!==" ||
      currentRefinementNode.operator === "!="
    ) {
      // $FlowIssue
      return [name, alternateType, refinementedType];
    }
    // $FlowIssue
    return [name, refinementedType, alternateType];
  }
}
