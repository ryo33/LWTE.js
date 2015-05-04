function LWJSTE(){
    this.templates = {};
    arguments.callee.escape_character = "#";
    arguments.callee.IF = 0;
    arguments.callee.EACH = 1;
    arguments.callee.SWITCH = 2;
    arguments.callee.LITERAL = 3;
    arguments.callee.VARIABLE = 4;
}
LWJSTE.prototype = {
    _parseTemplate : function(str){
        var LITERAL = 0, EACH = 1, IF = 2, ELIF = 3, ELSE = 4, ID = 5, SWITCH = 6, CASE = 7, DEFAULT = 8, L_CB = 9, R_CB = 10, EACH_END = 12, IF_END = 13, SWITCH_END = 14;
        var tokens = [];
        //lexer
        var token = "";
        var lines_count = 1;
        var literal = true;
        var last_is_escape = false;
        var pushed = false;
        function success(result){
            return [0, result];
        }
        function faild_token(token, message){
            return [1, message == undefined ? "" : message, [token[2], token[1]]];
        }
        function faild_message(message){
            return [1, message, []];
        }
        function push(type, lexeme){
            if(lexeme.length != 0){
                tokens.push([type, lexeme, lines_count]);
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
            if(str[i] == "\n"){
                lines_count ++;
            }
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
                }else if(str[i] == " "){
                    if(token.length != 0){
                        push_reserved_word(token);
                    }
                }else{
                    token += str[i];
                }
            }
        }
        if(literal){
            if(token.length != 0){
                push(LITERAL, token);
            }
        }else{
            return faild_message("unclosed curly brackets");
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
        var switch_opens = 0, case_used = [], default_used = []; //used when in switch blocks
        var unexpected_tokens = [ELIF, ELSE, CASE, DEFAULT, EACH_END, IF_END, SWITCH_END];
        function drop(array, index){
            array.splice(index, 1);
        }
        function set_unexpected_token(token){
            if(token instanceof Array){
                for(var i = 0, len = token.length; i < len; i ++){
                    set_unexpected_token(token[i]);
                }
            }else{
                if(unexpected_tokens.indexOf(token) == -1){
                    unexpected_tokens.push(token);
                }
            }
        }
        function remove_unexpected_token(token){
            if(token instanceof Array){
                for(var i = 0, len = token.length; i < len; i ++){
                    remove_unexpected_token(token[i]);
                }
            }else{
                for(var i = 0, len = unexpected_tokens.length; i < len; i ++){
                    if(token == unexpected_tokens[i]){
                        drop(unexpected_tokens, i);
                        break;
                    }
                }
            }
        }
        function move_node_parent(count){
            drop(indexes, indexes.length - 1);
            indexes[indexes.length - 1] = parent_nodes[parent_nodes.length - 1];
            drop(parent_nodes, parent_nodes.length - 1);
            if(count != undefined && count > 1){
                move_node_parent(count - 1);
            }
        }
        function move_node_child(index){
            if(index == undefined){
                index = node.length - 1;
            }
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
        function format_statement(){
            var result = [];
            for(var i = 1, len = in_cb.length; i < len; i ++){
                result.push(in_cb[i][1]);
            }
            return result;
        }
        while(progress < token_length){
            if(unexpected_tokens.indexOf(tokens[progress][0]) != -1){
                return faild_token(tokens[progress], "unexpected token");
            }
            get_current_node();
            if(! cb_open){
                switch(tokens[progress][0]){
                    case LITERAL:
                        node.push([LWJSTE.LITERAL, tokens[progress][1]]);
                        break;
                    case L_CB:
                        cb_open = true;
                        in_cb = [];
                        break;
                }
            }else{
                if(tokens[progress][0] == R_CB){
                    cb_open = false;
                    switch(in_cb[0][0]){
                        case IF:
                            if(in_cb.length == 1){
                                return faild_token(tokens[progress]);
                            }else{
                                if_opens ++;
                                else_used.push(false);
                                node.push([LWJSTE.IF, [[format_statement(), []]], []]);
                                move_node_child();
                                move_node_child(1);
                                move_node_child(0);
                                move_node_child(1);
                                remove_unexpected_token([ELIF, ELSE, IF_END]);
                            }
                            break;
                        case ELIF:
                            if(if_opens == 0 || in_cb.length == 1 || else_used[if_opens]){
                                return faild_token(tokens[progress]);
                            }else{
                                drop(in_cb, 0);
                                move_node_parent(2);
                                get_current_node();
                                node.push([format_statement(), []]);
                                move_node_child();
                                move_node_child(1);
                            }
                            break;
                        case ELSE:
                            if(if_opens == 0 || else_used[if_opens] || in_cb.length != 1){
                                return faild_token(tokens[progress]);
                            }else{
                                else_used[if_opens] = true;
                                move_node_parent(3);
                                move_node_child(2);
                                set_unexpected_token(ELIF);
                            }
                            break;
                        case IF_END:
                            if(if_opens == 0 || in_cb.length != 1){
                                return faild_token(tokens[progress]);
                            }else{
                                if(else_used[if_opens]){
                                    drop(else_used, if_opens);
                                    move_node_parent(2);
                                }else{
                                    move_node_parent(4);
                                }
                                if_opens --;
                                set_unexpected_token([ELIF, ELSE, IF_END]);
                            }
                            break;
                        case EACH:
                            if(in_cb.length != 2){
                                return faild_token(tokens[progress]);
                            }else{
                                each_opens ++;
                                node.push([LWJSTE.EACH, in_cb[1][1], []]);
                                move_node_child();
                                move_node_child(2);
                                remove_unexpected_token(EACH_END);
                            }
                            break;
                        case EACH_END:
                            if(each_opens == 0 || in_cb.length != 1){
                                return faild_token(tokens[progress]);
                            }else{
                                move_node_parent(2);
                                each_opens --;
                                set_unexpected_token(EACH_END);
                            }
                            break;
                        case SWITCH:
                            if(in_cb.length != 2){
                                return faild_token(tokens[progress]);
                            }else{
                                switch_opens ++;
                                case_used.push(false);
                                default_used.push(false);
                                node.push([LWJSTE.SWITCH, in_cb[1][1], [], []]);
                                move_node_child();
                                move_node_child(2);
                                remove_unexpected_token([CASE, DEFAULT, SWITCH_END]);
                                set_unexpected_token([EACH, IF, LITERAL, SWITCH]);
                            }
                            break;
                        case CASE:
                            if(switch_opens == 0 || default_used[switch_opens] || in_cb.length == 1){
                                return faild_token(tokens[progress]);
                            }else{
                                if(case_used[switch_opens]){
                                    parent_nodes(2);
                                    get_current_node();
                                }
                                node.push([format_statement(), []]);
                                move_node_child();
                                move_node_child(1);
                                case_used[switch_opens] = true;
                                remove_unexpected_token([EACH, IF, LITERAL, SWITCH]);
                            }
                            break;
                        case DEFAULT:
                            if(switch_opens == 0 || default_used[switch_opens] || in_cb.length != 1){
                                return faild_token(tokens[progress]);
                            }else{
                                default_used[switch_opens] = true;
                                if(case_used[switch_opens]){
                                    move_node_parent(3);
                                }else{
                                    move_node_parent();
                                }
                                move_node_child(3);
                                set_unexpected_token(CASE);
                                remove_unexpected_token([EACH, IF, LITERAL, SWITCH]);
                            }
                            break;
                        case SWITCH_END:
                            if(switch_opens == 0 || case_used[switch_opens] == false || in_cb.length != 1){
                                return faild_token(tokens[progress]);
                            }else{
                                if(default_used[switch_opens]){
                                    move_node_parent(2);
                                }else if(case_used[switch_opens]){
                                    move_node_parent(4);
                                }
                                switch_opens --;
                                set_unexpected_token([CASE, DEFAULT, SWITCH_END]);
                            }
                            break;
                        case ID:
                            if(in_cb.length != 1){
                                return faild_token(tokens[progress]);
                            }else{
                                node.push([LWJSTE.VARIABLE, in_cb[0][1]]);
                            }
                            break;
                        default:
                            return faild_token(tokens[progress]);
                    }
                    in_cb = [];
                }
                in_cb.push(tokens[progress]);
            }
            progress ++;
        }
        if(switch_opens > 0 || if_opens > 0 || each_opens > 0){
            var if_c = if_opens > 0 ? " " + if_opens + " if" : "";
            var each_c = each_opens > 0 ? " " + each_opens + " each" : "";
            var switch_c = switch_opens > 0 ? " " + switch_opens + " switch" : "";
            return faild_message("found not closed" + if_c + each_c + switch_c);
        }
        return success(result);
    },
    addTemplate : function(name, template){
        var result = this._parseTemplate(template);
        if(result[0] == 0){
            this.templates[name] = result[1];
        }else{
            //TODO error
        }
    },
    _useTemplate : function(template, data){
        var result = "";
        var template = this.templates[name];
        for(var i = 0, len = template.length; i < len; i ++){
            switch(template[i][0]){
                case this.LITERAL:
                    result += template[i][1];
                    break;
                case this.VARIABLE:
                    result += data[template[i][1]];
                    break;
                case this.EACH:
                    for(var j = 0, len = data[template[i][1]].length; j < len; j ++){
                        result += this._useTemplate(template[i][2], data[template[i][1][j]]);
                    }
                    break;
                case this.IF:
                    break;
                case this.SWITCH:
                    break;
            }
        }
    }
    useTemplate : function(name, data){
        return this._useTemplate(this.templates[name], data);
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
