(function(global){
    "use strict;"

    function LWTE(){
        this.templates = {};
        arguments.callee.escape_character = "#";
        arguments.callee.IF = 0;
        arguments.callee.EACH = 1;
        arguments.callee.SWITCH = 2;
        arguments.callee.LITERAL = 3;
        arguments.callee.VARIABLE = 4;
        arguments.callee.USE = 5;
        arguments.callee.HTML = 6;
    }
    LWTE.prototype['useTemplate'] = useTemplate; //("TEMPLATE_NAME", DATA)
    LWTE.prototype['addTemplate'] = addTemplate; //("TEMPLATE_NAME", "TEMPLATE")
    LWTE.prototype['removeTemplate'] = removeTemplate; //() or ("TEMPLATE_NAME")
    LWTE.prototype['saveTemplates'] = saveTemplates; //("destination")
    LWTE.prototype['loadTemplates'] = loadTemplates; //("source")
    LWTE.prototype['_parseTemplate'] = _parseTemplate;
    LWTE.prototype['_useTemplate'] = _useTemplate;
    LWTE.prototype['_evaluateVariable'] = _evaluateVariable;
    LWTE.prototype['_escapeHtml'] = _escapeHtml;
    function _parseTemplate(str){
        var LITERAL = 0, EACH = 1, IF = 2, ELIF = 3, ELSE = 4, ID = 5, SWITCH = 6, CASE = 7, DEFAULT = 8, L_CB = 9, R_CB = 10, EACH_END = 12, IF_END = 13, SWITCH_END = 14, USE = 15, HTML = 16;
        var tokens = [];
        //lexer
        var token = "";
        var lines_count = 1;
        var characters_count = 0;
        var literal = true;
        var last_is_escape = false;
        var pushed = false;
        var in_quotation = false; //used in curly brackets
        var used_quotation = null; //used with in_quotation
        function success(result){
            return [0, result];
        }
        function faild_token(token, message){
            return [1, message == undefined ? "" : message, token[2], token[3], token[1]];
        }
        function faild_message(message){
            return [1, message, []];
        }
        function push(type, lexeme){
            if(lexeme.length != 0){
                tokens.push([type, lexeme, lines_count, characters_count]);
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
                case "use": push(USE, token); break;
                case "html": push(HTML, token); break;
                default: push(ID, token);
            }
        }
        for(var i = 0, len = str.length; i < len; i ++){
            if(str[i] == "\n"){
                lines_count ++;
                characters_count = 0;
            }
            characters_count ++;
            if(literal){
                if(last_is_escape){
                    last_is_escape = false;
                    if(str[i] == LWTE.escape_character){
                        token += LWTE.escape_character;
                    }else{
                        token += LWTE.escape_character + str[i];
                    }
                }else{
                    if(str[i] == LWTE.escape_character){
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
                if(last_is_escape){
                    last_is_escape = false;
                    if(str[i] == LWTE.escape_character){
                        token += str[i];
                    }else{
                        token += LWTE.escape_character + str[i];
                    }
                }else if(in_quotation){
                    if(str[i] == LWTE.escape_character){
                        last_is_escape = true;
                    }else if(str[i] == used_quotation){
                        in_quotation = false;
                    }else{
                        token += str[i];
                    }
                }else{
                    if(str[i] == LWTE.escape_character){
                        last_is_escape = true;
                    }else if(str[i] == "}"){
                        if(token.length != 0){
                            push_reserved_word(token);
                        }
                        push(R_CB, "}");
                        pushed = false;
                        literal = true;
                    }else if(str[i] == "\"" || str[i] == "'"){
                        in_quotation = true;
                        used_quotation = str[i];
                    }else if(str[i] == " "){
                        if(token.length != 0){
                            push_reserved_word(token);
                        }
                    }else{
                        token += str[i];
                    }
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
        var unexpected_tokens_default = [ELIF, ELSE, CASE, DEFAULT, EACH_END, IF_END, SWITCH_END];
        var unexpected_tokens = [unexpected_tokens_default];
        var literal_skip = false; //not push literal if this was true
        function drop(array, index){
            array.splice(index, 1);
        }
        function get_opens(){
            return if_opens + each_opens + switch_opens;
        }
        function update_unexpected_tokens(){
            var opens = get_opens();
            if(opens < unexpected_tokens.length - 1){
                drop(unexpected_tokens, unexpected_tokens.length - 1);
            }else if(opens > unexpected_tokens.length - 1){
                for(var i = 0, len = opens - unexpected_tokens.length + 1; i < len; i ++){
                    unexpected_tokens.push(unexpected_tokens_default);
                }
            }
        }
        function set_unexpected_token(token){
            update_unexpected_tokens();
            if(token instanceof Array){
                for(var i = 0, len = token.length; i < len; i ++){
                    set_unexpected_token(token[i]);
                }
            }else{
                if(unexpected_tokens[get_opens()].indexOf(token) == -1){
                    unexpected_tokens[get_opens()].push(token);
                }
            }
        }
        function remove_unexpected_token(token){
            update_unexpected_tokens();
            if(token instanceof Array){
                for(var i = 0, len = token.length; i < len; i ++){
                    remove_unexpected_token(token[i]);
                }
            }else{
                for(var i = 0, len = unexpected_tokens[get_opens()].length; i < len; i ++){
                    if(token == unexpected_tokens[get_opens()][i]){
                        drop(unexpected_tokens[get_opens()], i);
                        break;
                    }
                }
            }
        }
        function check_unexpected_token(){
            update_unexpected_tokens();
            if(unexpected_tokens[get_opens()].indexOf(tokens[progress][0]) != -1){
                return true;
            }
            return false;
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
            if(check_unexpected_token()){
                return faild_token(tokens[progress], "unexpected token");
            }
            get_current_node();
            if(! cb_open){
                switch(tokens[progress][0]){
                    case LITERAL:
                        if(! literal_skip){
                            node.push([LWTE.LITERAL, tokens[progress][1]]);
                        }
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
                                node.push([LWTE.IF, [[format_statement(), []]], []]);
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
                            }
                            break;
                        case EACH:
                            if(in_cb.length != 2){
                                return faild_token(tokens[progress]);
                            }else{
                                each_opens ++;
                                node.push([LWTE.EACH, in_cb[1][1], []]);
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
                            }
                            break;
                        case SWITCH:
                            if(in_cb.length != 2){
                                return faild_token(tokens[progress]);
                            }else{
                                switch_opens ++;
                                case_used.push(false);
                                default_used.push(false);
                                node.push([LWTE.SWITCH, in_cb[1][1], [], []]);
                                move_node_child();
                                move_node_child(2);
                                remove_unexpected_token([CASE, DEFAULT, SWITCH_END]);
                                set_unexpected_token([EACH, IF, SWITCH]);
                                literal_skip = true;
                            }
                            break;
                        case CASE:
                            if(switch_opens == 0 || default_used[switch_opens] || in_cb.length == 1){
                                return faild_token(tokens[progress]);
                            }else{
                                if(case_used[switch_opens]){
                                    move_node_parent(2);
                                    get_current_node();
                                }
                                node.push([format_statement(), []]);
                                move_node_child();
                                move_node_child(1);
                                case_used[switch_opens] = true;
                                remove_unexpected_token([EACH, IF, SWITCH]);
                                literal_skip = false;
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
                                remove_unexpected_token([EACH, IF, SWITCH]);
                                literal_skip = false;
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
                                literal_skip = false;
                            }
                            break;
                        case ID:
                            if(in_cb.length != 1){
                                return faild_token(tokens[progress]);
                            }else{
                                node.push([LWTE.VARIABLE, in_cb[0][1]]);
                            }
                            break;
                        case USE:
                            if(in_cb.length != 3){
                                return faild_token(tokens[progress]);
                            }else{
                                node.push([LWTE.USE, in_cb[1][1], in_cb[2][1]]);
                            }
                            break;
                        case HTML:
                            if(in_cb.length != 2){
                                return faild_token(tokens[progress]);
                            }else{
                                node.push([LWTE.HTML, in_cb[1][1]]);
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
    }
    function addTemplate(name, template){
        var result = this._parseTemplate(template);
        if(result[0] == 0){
            this.templates[name] = result[1];
            return false;
        }else{
            return result.slice(1);
        }
    }
    function _evaluateVariable(variable){
        if((variable === false) ||
                (variable == null) ||
                (variable instanceof Object && Object.keys(variable).length === 0) ||
                (variable instanceof Array && variable.length == 0)){
            return false;
        }
        return true;
    }
    function _escapeHtml(text){
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function _useTemplate(template, data){
        var result = "";
        for(var i = 0, leni = template.length; i < leni; i ++){
            switch(template[i][0]){
                case LWTE.LITERAL:
                    result += template[i][1];
                    break;
                case LWTE.VARIABLE:
                    result += this._escapeHtml(String(data[template[i][1]]));
                    break;
                case LWTE.HTML:
                    result += String(data[template[i][1]]);
                    break;
                case LWTE.EACH:
                    for(var j = 0, lenj = data[template[i][1]].length; j < lenj; j ++){
                        result += this._useTemplate(template[i][2], data[template[i][1]][j]);
                    }
                    break;
                case LWTE.IF:
                    var do_else_process = true; //do else process if true
                    for(var j = 0, lenj = template[i][1].length; j < lenj; j ++){
                        var do_process = true;
                        //AND
                        for(var k = 0, lenk = template[i][1][j][0].length; k < lenk; k ++){
                            if(this._evaluateVariable(data[template[i][1][j][0][k]]) == false){
                                do_process = false;
                                break;
                            }
                        }
                        if(do_process){
                            result += this._useTemplate(template[i][1][j][1], data);
                            do_else_process = false;
                            break;
                        }
                    }
                    if(do_else_process){
                        result += this._useTemplate(template[i][2], data);
                    }
                    break;
                case LWTE.SWITCH:
                    var do_default_process = true; //do default process if true
                    for(var j = 0, lenj = template[i][2].length; j < lenj; j ++){
                        var do_process = false;
                        //OR
                        for(var k = 0, lenk = template[i][2][j][0].length; k < lenk; k ++){
                            console.log(data[template[i][1]]);
                            console.log(template[i][2][j][0][k]);
                            if(data[template[i][1]] == template[i][2][j][0][k]){
                                do_process = true;
                                break;
                            }
                        }
                        if(do_process){
                            result += this._useTemplate(template[i][2][j][1], data);
                            do_default_process = false;
                        }
                    }
                    if(do_default_process){
                        result += this._useTemplate(template[i][3], data);
                    }
                    break;
                case LWTE.USE:
                    result += this.useTemplate(template[i][1], data[template[i][2]]);
                    break;
            }
        }
        return result;
    }
    function useTemplate(name, data){
        return this._useTemplate(this.templates[name], data);
    }
    function removeTemplate(name){
        if(name == null){
            this.templates = {};
        }else if(name in this.templates){
            delete this.templates[name];
        }
    }
    function saveTemplates(destination){
        localStorage.setItem(destination, templates);
    }
    function loadTemplates(source){
        this.templates = localStorage.getItem(source);
    }
    
    if("process" in global){
        module.exports = LWTE;
    }
    global['LWTE'] = LWTE;
})((this || 0).self || global);
