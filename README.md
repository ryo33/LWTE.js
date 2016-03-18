# LWTE.js
This is the Light Weight Template Engine for JavaScript.  
## Description
### Example  
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
            <td>{}</td>
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
        {datas : ["1", "2"]},
        {datas : ["3", "4"]}
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
### How to write templates  
Briefly, just write `{VAR_NAME}`.  
But there are 11 reserved keywords.  
`if`, `elif`, `else`, `/if`, `each`, `/each`, `switch`, `case`, `default`, `/switch`, `use`, `html`  
You can't use them as variable name even if they contain capital letters.  
### Syntax  
`DATA` is a data which is given to `lwte.useTemplate`.  
- `{}`  
Displays `DATA` with html-escape.  
- `{VAR_NAME}`  
Displays `DATA[VAR_NAME]` with html-escape.  
- `{if VAR_NAME ...}{elif VAR_NAME ...}{else}{/if}`  
You can use this just like general if-elif-else-statement.  
Controlling expressions will be treated as true if all variables are evaluated as true.  
- `{each VAR_NAME}{/each}`  
You can use this just like general foreach-statement.  
- `{switch VAR_NAME}{case VALUE ...}{default}{/switch}`  
You can use this just like general switch-statement.  
But switch-statement of LWTE.js doesn't do fall through.  
Case-statements which has one or more true values will be executed.  
- `{use TEMPLATE_NAME VAR_NAME}`  
You can use this just like `lwte.useTemplate(TEMPLATE_NAME, DATA[VAR_NAME])`.  
- `{html VAR_NAME}`  
Displays `DATA[VAR_NAME]` **without html-escape**.

### Evaluating variable  
false : `false`, `undefined`, `null`, `[]`, and `{}`  
true : all other  

## Requirement  
This is a stand-alone JavaScript library.
## Usage  
Do `npm install lwte` or  
clone this repository.  
And require `lwte.js`.    
```javascript
var lwte = new LWTE(); //create LWTE instance
lwte.addTemplate("TEMPLATE_NAME", "TEMPLATE"); //add templates
var result = lwte.useTemplate("TEMPLATE_NAME", DATA); //use templates
//also you can save compiled templates
```
## License  
  [License](LICENSE)
## Author  
  [ryo33](https://github.com/ryo33/ "ryo33's github page")
