# LWTE.js
This is the Light Weight Template Engine for JavaScript.
###Description
#####Example
Template:  
```html
<p>{text}</p>
{if table}
<table>
    {if table-head}
    <thead>
    <tr>
        {each table-head}
            <th>{name}</th>
        {/each}
    </tr>
    </thead>
    {/if}
    <tbody>
    {each table-body}
        <tr>
        {each datas}
            <td>{data}</td>
        {/each}
        </tr>
    {/each}
    </tbody>
</table>
{/if}
```
Data:
```javascript
{
    "text" : "This is an example.",
    "table" : true,
    "table-body" : [
        {datas : [{data: "1"}, {data: "2"}]},
        {datas : [{data: "3"}, {data: "4"}]}
    ]
}
```
Result:
```html
<p>This is an example.</p>
<table>
    <tbody>
        <tr>                    
            <td>1</td>
            <td>2</td>
        </tr>
        <tr>
            <td>3</td>
            <td>4</td>
        </tr>
    </tbody>
</table>
```
That's almost all!  
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
```javascript
var lwte = new LWTE(); //create LWTE instance
lwte.addTemplate("TEMPLATE_NAME", "TEMPLATE"); //add templates
var result = lwte.useTemplate("TEMPLATE_NAME", DATA); //use templates
//also you can save compiled templates
```
###License
  [License](LICENSE)
###Author
  [ryo33](https://github.com/ryo33/ "ryo33's github page")
