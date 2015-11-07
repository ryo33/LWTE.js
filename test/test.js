var should = require('should');
var assert = require('assert');
var LWTE = require('../lwte.min.js');

lwte = new LWTE();

describe("compile", function(){
    describe("success", function(){
    });
    describe("failure", function(){
        describe("not closed", function(){
            it("if is not closed", function(){lwte.addTemplate("a", "{if a}a{else}").should.not.be.exactly(false)});
            it("each is not closed", function(){lwte.addTemplate("a", "{each a}a").should.not.be.exactly(false)});
            it("switch is not closed", function(){lwte.addTemplate("a", "{switch a}a").should.not.be.exactly(false)});
        });
        it("elif after else", function(){lwte.addTemplate("a", "{if a}a{else}b{elif}c{/if}").should.not.be.exactly(false)});
    });
});
describe("use", function(){
    describe("success", function(){
        it("variable", function(){
            lwte.addTemplate("a", "{a}");
            lwte.useTemplate("a", {a: "<>&\"'"}).should.be.exactly("&lt;&gt;&amp;&quot;&#039;");
        });
        it("html", function(){
            lwte.addTemplate("a", "{html a}");
            lwte.useTemplate("a", {a: "<>&\"'"}).should.be.exactly("<>&\"'");
        });
        it("direct", function(){
            lwte.addTemplate("a", "{}");
            lwte.useTemplate("a", "<>&\"'").should.be.exactly("&lt;&gt;&amp;&quot;&#039;");
        });
        it("if", function(){
            lwte.addTemplate("a", "{if a}a{elif b}b{elif c}c{elif d}d{elif e}e{elif f}f{else}else{/if}{if f e}fe{elif f g}fg{/if}");
            lwte.useTemplate("a", {a: false, b: [], c: {}, d: null, e: undefined, f: 0, g: true}).should.be.exactly("ffg");
        });
        it("switch", function(){
            lwte.addTemplate("a", "{switch a}{case aaa} aaa {case aa} aa {case aaa aa} aaaaa {default} default{/switch}");
            lwte.useTemplate("a", {a: "aaa"}).should.be.exactly(" aaa  aaaaa ");
        });
        it("each", function(){
            lwte.addTemplate("a", "{each a}aa{item}{if a}aa{/if}{/each}");
            lwte.useTemplate("a", {a: [{a: true, item: "b"}, {item: "c"}, {item: "d"}, {item: "e"}]}).should.be.exactly("aabaaaacaadaae");
            lwte.addTemplate("a", "{each a}[{each b}({item}){/each}]{/each}");
            lwte.useTemplate("a", {a: [{b: [{item: "e"}, {item: "f"}]}, {b: [{item: "g"}, {item: "h"}]}]}).should.be.exactly("[(e)(f)][(g)(h)]");
        });
        it("use", function(){
            lwte.addTemplate("a", "bbbb{item}");
            lwte.addTemplate("b", "aa{use a a}aa");
            lwte.useTemplate("b", {a: {item: "ITEM"}}).should.be.exactly("aabbbbITEMaa");
        });
    });
});
