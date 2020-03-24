(this.webpackJsonp=this.webpackJsonp||[]).push([[19],{1310:function(e,t,n){"use strict";n.r(t),n.d(t,"_frontmatter",(function(){return i})),n.d(t,"default",(function(){return u}));n(19),n(5),n(3),n(1),n(13),n(14),n(22);var a=n(59),r=n(66);n(36);function l(){return(l=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e}).apply(this,arguments)}var i={};void 0!==i&&i&&i===Object(i)&&Object.isExtensible(i)&&!i.hasOwnProperty("__filemeta")&&Object.defineProperty(i,"__filemeta",{configurable:!0,value:{name:"_frontmatter",filename:"src/docs/docs/type-annotations.mdx"}});var o={_frontmatter:i},s=r.a;function u(e){var t=e.components,n=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,["components"]);return Object(a.b)(s,l({},o,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h1",{id:"type-annotations"},"Type Annotations"),Object(a.b)("hr",null),Object(a.b)("p",null,"Type Annotations it's the most valuable part of Hegel."),Object(a.b)("p",null,"Type Annotation is an ability to declare values that are valid for the variable. Lets explore this ability."),Object(a.b)("p",null,"First of all, lets write a simple function in pure JavaScript."),Object(a.b)("pre",null,Object(a.b)("code",l({parentName:"pre"},{className:"language-typescript"}),"function mul(a, b) {\n  return a * b;\n}\n")),Object(a.b)("p",null,"So, you can apply this function with different values:"),Object(a.b)("pre",null,Object(a.b)("code",l({parentName:"pre"},{className:"language-typescript"}),'mul(42, 42);               // 1764\nmul(42, "42");             // 1764\nmul(true, "42");           // 42\nmul(class User {}, "42");  // NaN\n')),Object(a.b)("p",null,"As you can see, applying this function with different data types sometimes will return a valid result.\nBut, you always want to get a valid result. So, you can add types."),Object(a.b)("pre",null,Object(a.b)("code",l({parentName:"pre"},{className:"language-typescript"}),"function mul(a: number, b: number) {\n  return a * b;\n}\n")),Object(a.b)("p",null,"And if you try to apply function by the same way in ",Object(a.b)("a",l({parentName:"p"},{href:"/hegel/try#GYVwdgxgLglg9mABAWxAGwBQEMBciwjIBGApgE4A0iReBx5AlIgN4BQiiZJUIZSWiAFTUA3KwC+rVqkwAWAExUFDERzXqNiAPRbEgXg3AMjsBCKTsQBRMmThk8AFQCeABxKIARAHIFHt4hgBnP0g4ZCcsWCI0VwB3GCgAC0QoZ1c3OlIyN2l0DAUqNwU3FU1NU11La1tERxd3KDIQEl8AoIgQsIioxFiEpJT3dPIsmQx6xvzC4o0yiysbe363CDQsf0CAVX8hv0CYYNDwmEiYuMTk2rTCDOGc5dWNrbIWcQn5IrEgA"}),"Playground")," then you will see that Hegel will reject invalid data types application and will notify you about the problem."),Object(a.b)("pre",null,Object(a.b)("code",l({parentName:"pre"},{className:"language-typescript"}),'function mul(a: number, b: number) {\n  return a * b;\n}\n\nmul(42, 42); // 👌!\n\n// Error: Type "\'42\'" is incompatible with type "number"\nmul(42, "42");            \n\n// Error: Type "true" is incompatible with type "number"\nmul(true, "42");      \n\n// Error: Type "class User" is incompatible with type "number"\nmul(class User {}, "42");\n')))}u&&u===Object(u)&&Object.isExtensible(u)&&!u.hasOwnProperty("__filemeta")&&Object.defineProperty(u,"__filemeta",{configurable:!0,value:{name:"MDXContent",filename:"src/docs/docs/type-annotations.mdx"}}),u.isMDXComponent=!0}}]);
//# sourceMappingURL=component---src-docs-docs-type-annotations-mdx-b6cfefc59006df9730d6.js.map