# LWTE.js
This is the Light Weight Template Engine for JavaScript.
###Description
#####Example
```javascript
lwte.addTemplate("template_name",
    "<p>{a}</p>" +
    "{each b}" +
    "{if c}" +
    "<p>c: {c}</p>" +
    "{/if}" +
    "{/each}"
  );
var result = lwte.useTemplate("template_name",
    {
      a: "It's an example.",
      b: [
        {c: "1"},
        {c: "2"},
        {d: "!"},
        {c: "3"}
      ]
    }
  );
//result -> "<p>It%#039;s an example.</p><p>c: 1</p><p>c: 2</p><p>c: 3</p>"
```
That's almost all!  
So, just do ...  
1. Call `lwte.addTemplate(TEMPLATE_NAME, TEMPLATE)` to add and compile the template.  
2. Call `lwte.useTemplate(TEMPLATE_NAME, DATA)` to use template.  
Also you can save the compiled templates into such as cookie and Web Strage.
####How to write templates
Briefly, just write `{VAR_NAME}`.  
But there are 11 reserved keywords.  
`if`, `elif`, `else`, `/if`, `each`, `/each`, `switch`, `case`, `default`, `/switch`, `use`, `html`  
You can't use them as variable name even if they contain capital letters.  
#####Syntax
- `{VAR_NAME}`  
LWTE.js replace this with doing html escape.
- `{if VAR_NAME ...}{elif VAR_NAME ...}{else}{/if}`  
You can use this just like general if-elif-else-statement.  
Controlling expressions will be treated as true if all variables are evaluated as true.  
- `{each VAR_NAME}{/each}`  
You can use this just like general foreach-statement.  
- `{switch}{case VAR_NAME ...}{default}{/switch}`  
You can use this just like general switch-statement.  
But switch-statement of LWTE.js doesn't do fall through.  
Case-statements will be executed if there are one or more variables are evaluated as true.  
- `{use TEMPLATE_NAME VAR_NAME}`  
You can use this just like `lwte.useTemplate(TEMPLATE_NAME, DATA[VAR_NAME])`.  
- `{html VAR_NAME}`  
You can use this just like {VAR_NAME}.  
But this will **not do html escape**.  

#####evaluating variable  
false : `false`, `undefined`, `null`, `[]`, and `{}`  
true : all other  

###Requirement
This is a stand-alone JavaScript library.
###Usage
Clone this repository and load `lwte.js`.
###License
  [License](LICENSE)
###Author
  [ryo33](https://github.com/ryo33/ "ryo33's github page")
