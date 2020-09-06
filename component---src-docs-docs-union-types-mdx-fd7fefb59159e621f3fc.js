(this.webpackJsonp=this.webpackJsonp||[]).push([[26],{1341:function(e,t,n){"use strict";n.r(t),n.d(t,"_frontmatter",(function(){return o})),n.d(t,"default",(function(){return u}));n(16),n(4),n(3),n(1),n(12),n(11),n(22);var r=n(57),i=n(63);n(36);function a(){return(a=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}var o={};void 0!==o&&o&&o===Object(o)&&Object.isExtensible(o)&&!o.hasOwnProperty("__filemeta")&&Object.defineProperty(o,"__filemeta",{configurable:!0,value:{name:"_frontmatter",filename:"src/docs/docs/union-types.mdx"}});var s={_frontmatter:o},p=i.a;function u(e){var t=e.components,n=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,["components"]);return Object(r.b)(p,a({},s,n,{components:t,mdxType:"MDXLayout"}),Object(r.b)("h1",{id:"union-types"},"Union Types"),Object(r.b)("hr",null),Object(r.b)("p",null,"Sometimes you need more than one type or need to concrete values from any of existed type. A simple example when you need values from two different types is ",Object(r.b)("inlineCode",{parentName:"p"},"repeat")," function, which is waiting argument as ",Object(r.b)("inlineCode",{parentName:"p"},"number")," or ",Object(r.b)("inlineCode",{parentName:"p"},"string")," and repeat given argument ",Object(r.b)("inlineCode",{parentName:"p"},"n")," times:"),Object(r.b)("pre",null,Object(r.b)("code",a({parentName:"pre"},{className:"language-typescript"}),'function repeat(target, times) {\n  if (typeof target === "number") {\n    return target ** times;\n  }\n  return target.repeat(times);\n}\n')),Object(r.b)("p",null,"You can define types like this:"),Object(r.b)("pre",null,Object(r.b)("code",a({parentName:"pre"},{className:"language-typescript"}),'function repeat(target: unknown, times: number): unknown {\n  if (typeof target === "number") {\n    return target ** times;\n  }\n\n  // Error: Property "repeat" does not exist in "unknown"\n  return target.repeat(times);\n}\n')),Object(r.b)("p",null,"But you will have an Error, because you try to get property from ",Object(r.b)("inlineCode",{parentName:"p"},"unknown")," type.\nYou can try to add one more ",Object(r.b)("inlineCode",{parentName:"p"},"if")," statement like this:"),Object(r.b)("pre",null,Object(r.b)("code",a({parentName:"pre"},{className:"language-typescript"}),'function repeat(target, times) {\n  if (typeof target === "number") {\n    return target ** times;\n  }\n  if (typeof target === "string") {\n    return target.repeat(times);\n  }\n  throw new TypeError(`Expected string or number, got \'${typeof target}\'.`);\n}\n\nconst result = repeat(false, 4);\n')),Object(r.b)("p",null,"But, if you put a wrong type (not number or string) you will find an error in runtime."),Object(r.b)("p",null,"So, the solution is union types. Actually, union types is a union of all possible values for types which will be provided to union operator ",Object(r.b)("inlineCode",{parentName:"p"},"|"),". You can define it by declaring sequence of needed types separated by '|':"),Object(r.b)("pre",null,Object(r.b)("code",a({parentName:"pre"},{className:"language-typescript"}),'let iCanBeAStringOrNumber: string | number = 2;\niCanBeAStringOrNumber = "Hello";\n\n// Error: Type "false" is incompatible with type "number | string"\niCanBeAStringOrNumber = false;\n')),Object(r.b)("blockquote",null,Object(r.b)("p",{parentName:"blockquote"},"When you defined union type you lost ability to use this type as concrete type.")),Object(r.b)("pre",null,Object(r.b)("code",a({parentName:"pre"},{className:"language-typescript"}),'const iCanBeAStringOrNumber: string | number = 2;\n\n// Error: Type "number | string" is incompatible with type "number"\nconst value: number = iCanBeAStringOrNumber;\n\n// Error: Parameter "number | string" is incompatible with type "bigint | number"\niCanBeAStringOrNumber * 4;\n')),Object(r.b)("p",null,"With union types ",Object(r.b)("inlineCode",{parentName:"p"},"repeat")," function will look like this:"),Object(r.b)("pre",null,Object(r.b)("code",a({parentName:"pre"},{className:"language-typescript"}),'function repeat(target: string | number, times: number): string | number {\n  if (typeof target === "number") {\n    return target ** times;\n  }\n  return target.repeat(times);\n}\n\n// Error: Type "false" is incompatible with type "number | string"\nconst result = repeat(false, 4);\n')),Object(r.b)("p",null,"And you will see wrong execution in static time (while you are writing code in editor)."),Object(r.b)("p",null,"Also, union types are usefull when you want to pick only concrete values from some type."),Object(r.b)("pre",null,Object(r.b)("code",a({parentName:"pre"},{className:"language-typescript"}),'function createResponse(status: "Success" | "Failed") {\n  return { status };\n}\n\nlet response = createResponse("Success");\nresponse = createResponse("Failed");\n\n// Error: Type "\'Custom String\'" is incompatible with type "\'Failed\' | \'Success\'"\nresponse = createResponse("Custom String");\n')))}void 0!==u&&u&&u===Object(u)&&Object.isExtensible(u)&&!u.hasOwnProperty("__filemeta")&&Object.defineProperty(u,"__filemeta",{configurable:!0,value:{name:"MDXContent",filename:"src/docs/docs/union-types.mdx"}}),u.isMDXComponent=!0}}]);
//# sourceMappingURL=component---src-docs-docs-union-types-mdx-fd7fefb59159e621f3fc.js.map