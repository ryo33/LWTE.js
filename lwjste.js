function LWJSTE(){
    this.templates = {};
    arguments.callee.escape_character = "#";
}
LWJSTE.prototype = {
    _parseTemplate : function(template){
        var LITERAL = 0, EACH = 1, IF = 2, ELIF = 3, ELSE = 4, ID = 5, SWITCH = 6, CASE = 7, LITERAL = 8, L_CB = 9, R_CB = 10, OPERATOR = 11;
        var tokens = [];
        var token = "";
        var literal = true;
        var last_is_escape = false;
        var operators = ["(", ")", "&", "|"];
        function push(type, lexeme=null){
            tokens.push([type, lexeme]);
            token = "";
        }
        for(var i = 0, len = template.length; i < len; i ++){
            if(literal){
                if(last_is_escape){
                    last_is_escape = false;
                    if(str[i] == LWJSTE.escape_character){
                        token += LWJSTE.escape_character;
                    }else{
                        token += LWJSTE.escape_character + str[i];
                    }
                }else{
                    if(str[i] == LWJSTE.escape_character){
                        last_is_escape = true;
                    }else if(str[i] == "{"){
                        push(LITERAL, token);
                        push(L_CB);
                        token = "";
                        literal = false;
                    }else{
                        token += str[i];
                    }
                }
            }else{
                if(str[i] == "}"){
                    items = token.split(" ");
                    if(items.length == 0){
                    }else if(items.length == 1){
                        push(ID, token);
                    }else{
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
                    }
                    literal = true;
                    push(R_CB);
                }else if(str[i] == " "){
                    token += str[i];
                }
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
