function LWJSTE(){
    this.templates = {};
    arguments.callee.escape_character = "#";
}
LWJSTE.prototype = {
    _parseTemplate : function(str){
        var LITERAL = 0, EACH = 1, IF = 2, ELIF = 3, ELSE = 4, ID = 5, SWITCH = 6, CASE = 7, LITERAL = 8, L_CB = 9, R_CB = 10, OPERATOR = 11, EACH_END = 12, IF_END = 13, SWITCH_END = 14, DEFAULT = 15;
        var tokens = [];
        //lexer
        var token = "";
        var literal = true;
        var last_is_escape = false;
        var operators = ["(", ")", "&", "|"];
        var pushed = false;
        function success(result){
            return [0, result];
        }
        function faild(result){
            return [1, result];
        }
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
        //syntactic analysis
        var progress = 0;
        var token_length = tokens.length;
        var result = []; //output of parser
        var node = result; //pointer to result
        var indexes = []; //indexes of result
        var parent_nodes = []; //used in move_node_parent
        var cb_open = false; //it's true when in curly brackets 
        var in_cb = []; //tokens in curly brackets
        var if_opens = 0, else_used = []; //used when in if blocks
        var each_opens = 0; //used when in each blocks
        var switch_opens = 0, default_used = []; //used when in switch blocks
        function drop(array, index){
            array.splice(index, 1);
        }
        function move_node_parent(count){
            drop(indexes, indexes.length - 1);
            indexes[indexes.length - 1] = parent_nodes[parent_nodes.length - 1];
            drop(parent_nodes, parent_nodes.length - 1);
            if(count != undefined && count > 1){
                move_node_parent(count - 1);
            }
        }
        function move_node_child(depth, index){
            parent_nodes.push(indexes[indexes.length - 1]);
            indexes.push(index);
        }
        function move_node(index){
            indexes[indexes.length - 1] = index;
        }
        function get_current_node(){
            node = result;
            for(var i = 0, len = indexes.length; i < len; i ++){
                node = node[indexes[i]];
            }
        }
        while(progress < token_length){
            get_current_node();
            if(! cb_open){
                switch(tokens[progress][0]){
                    case LITERAL:
                        node.push(tokens[progress]);
                        break;
                    case L_CB:
                        cb_open = true;
                        in_cb = [];
                        break;
                    default:
                        //TODO error
                }
            }else{
                if(tokens[progress][0] == R_CB){
                    cb_open = false;
                    switch(in_cb[0][0]){
                        case IF:
                            if(in_cb.length == 1){
                                //TODO error
                            }else{
                                else_used.push(false);
                                drop(in_cb, 0);
                                node.push([IF, [[parse_expression(in_cb), []]], []]);
                                move_node_child(node.length - 1);
                                move_node_child(1);
                                move_node_child(0);
                                move_node_child(1);
                            }
                            break;
                        case ELIF:
                            if(if_opens == 0 || in_cb.length == 1 || else_used[if_opens]){
                                //TODO error
                            }else{
                                drop(in_cb, 0);
                                move_node_parent(2);
                                node = get_current_node();
                                node.push([parse_expression(in_cb), []]);
                                move_node_child(node.length - 1);
                                move_node_child(1);
                            }
                            break;
                        case ELSE:
                            if(if_opens == 0 || else_used[if_opens] || in_cb.length != 1){
                                //TODO error
                            }else{
                                else_used[if_opens] = true;
                                move_node_parent(3);
                                node = get_current_node();
                                node.push([]);
                                move_node_child(0);
                            }
                            break;
                        case IF_END:
                            if(if_opens == 0 || in_cb.length != 1){
                                //TODO error
                            }else{
                                if(else_used[if_opens]){
                                    drop(else_used, if_opens);
                                    move_node_parent(2);
                                }else{
                                    move_node_parent(3);
                                }
                                if_opens --;
                            }
                            break;
                        case EACH:
                            if(in_cb.length != 2){
                                //TODO error
                            }
                            break;
                        case EACH_END:
                            if(each_opens == 0 || in_cb.length != 1){
                                //TODO error
                            }else{
                            }
                            break;
                        case SWITCH:
                            if(in_cb.length != 2){
                                //TODO error
                            }
                            break;
                        case CASE:
                            if(switch_opens == 0 || default_used[switch_opens] || in_cb.length == 1){
                                //TODO error
                            }else{
                            }
                            break;
                        case DEFAULT:
                            if(switch_opens == 0 || default_used[switch_opens] || in_cb.length != 1){
                                //TODO error
                            }else{
                            }
                            break;
                        case SWITCH_END:
                            if(switch_opens == 0 || in_cb.length != 1){
                                //TODO error
                            }else{
                            }
                            break;
                        case ID:
                            break;
                        default:
                            //TODO error
                    }
                    in_cb = [];
                }
                in_cb.push(tokens[progress]);
            }
            progress ++;
        }
        return success(result);
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
