function LWJSTE(){
    this.templates = {};
    arguments.callee.escape_character = "#";
}
LWJSTE.prototype = {
    _parseTemplate : function(str){
        var LITERAL = 0, EACH = 1, IF = 2, ELIF = 3, ELSE = 4, ID = 5, SWITCH = 6, CASE = 7, LITERAL = 8, L_CB = 9, R_CB = 10, OPERATOR = 11, EACH_END = 12, IF_END = 13, SWITCH_END = 14, DEFAULT = 15;
        var tokens = [];
        var token = "";
        var literal = true;
        var last_is_escape = false;
        var operators = ["(", ")", "&", "|"];
        var pushed = false;
        function push(type, lexeme){
            if(lexeme.length != 0){
                tokens.push([type, lexeme]);
                token = "";
            }
        }
        function push_reserved_word(token){
            switch(token.toLowerCase()){
                case "if": push(IF, token); break;
                case "elif": push(ELIF, token); break;
                case "else": push(ELSE, token); break;
                case "/if": push(IF_END, token); break;
                case "each": push(EACH, token); break;
                case "/each": push(EACH_END, token); break;
                case "switch": push(SWITCH, token); break;
                case "case": push(CASE, token); break;
                case "default": push(DEFAULT, token); break;
                case "/switch": push(SWITCH_END, token); break;
                default: push(ID, token);
            }
        }
        for(var i = 0, len = str.length; i < len; i ++){
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
                        push(L_CB, "{");
                        literal = false;
                    }else{
                        token += str[i];
                    }
                }
            }else{
                if(str[i] == "}"){
                    if(token.length != 0){
                        push_reserved_word(token);
                    }
                    push(R_CB, "}");
                    pushed = false;
                    literal = true;
                }else if(str[i] == " " || operators.indexOf(str[i]) != -1){
                    if(token.length != 0){
                        push_reserved_word(token);
                    }
                    if(str[i] != " "){
                        push(OPERATOR, str[i]);
                    }
                }else{
                    token += str[i];
                }
            }
        }
        if(literal && token.length != 0){
            push(LITERAL, token);
        }else{
            //TODO error
        }
        return tokens;
        //TODO
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
