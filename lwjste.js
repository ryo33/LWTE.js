function LWJSTE(){
    this.templates = {};
}
LWJSTE.prototype = {
    _parseTemplate : function(template){
        var LITERAL = 0, EACH = 1, IF = 2, ELIF = 3, ELSE = 4, ID = 5, SWITCH = 6, CASE = 7, LITERAL = 8, OPEN = 9, CLOSE = 10;
        var tokens = [];
        var token = "";
        var literal = true;
        var last_is_open = false;
        function push(type, lexeme=null){
            tokens.push([type, lexeme]);
            token = "";
        }
        for(var i = 0, len = template.length; i < len; i ++){
            if(literal){
                if(last_is_open){
                    last_is_open = false;
                    if(str[i] == "{"){
                        token += "{";
                    }else{
                        push(LITERAL, token);
                        push(OPEN);
                        token = "";
                        literal = false;
                    }
                }else{
                    if(str[i] == "{"){
                        last_is_open = true;
                    }else{
                        token += str[i];
                    }
                }
            }else{
                if(str[i] == "}"){
                    if(token.length != 0){
                        switch(token.toLowerCase()){
                            case "if":
                                break;
                            case "elif":
                                break;
                            case "else":
                                break;
                            case "each":
                                break;
                            case "switch":
                                break;
                            case "case":
                                break;
                        }
                        push(ID, token);
                    }
                    literal = true;
                    push(CLOSE);
                }else if(str[i] == " "){
                    if(token.length != 0){
                        push(ID, token);
                    }
                }else{
                    token += str[i];
                }
                //TODO
            }
        }
        if(literal){
            push(LITERAL, token);
            token = "";
        }
    },
    addTemplate : function(name, template){
        this.templates[name] = this._parseTemplate(template);
    },
    useTemplate : function(selector, name, template){
    },
    removeTemplate : function(name){
        if(name == null){
            this.templates = {};
        }else if(name in this.templates){
            delete this.templates[name];
        }
    },
    saveTemplates : function(destination){
    },
    loadTemplates : function(source){
    }
};
lwjste = new LWJSTE();
