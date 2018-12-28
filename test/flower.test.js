import assert from 'assert';
import parser from '../src/js/parser.js';
import symbolizer from '../src/js/symbolizer';
import flower from '../src/js/flower';
import { parseCode } from '../src/js/code-analyzer';

var obj;
var input_vector;

describe('Check Symbolizer functionallity', () => {
    it('Amount of groups', () => {
        var input_vector2 = "x=3,y=2,z=1";

        var func = `
        function foo(x, y, z){
            let a = x + 1;
            let b = a + y;
            let c = 0;
            
            if (b < z) {
                c = c + 5;
                if (b < x) {
                   c = c + 6;
                } else if (b < z * 3) {
                   c = c + x + 7;
                } else {
                   c = c + z + 8;
                }
            } else if (b < z * 2) {
                c = c + x + 5;
            } else {
                c = c + z + 5;
            }
        
        if(x>y)
            x = x+4;
            return c;
        }`
        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector2, _line);
        var groups = flower.code2groups(symbols, _container);
        flower.groups2diagram(groups)

        assert.equal(
            groups.length.toString(),
            '6'
        );
    });

    it('Amount of groups #2', () => {
        var input_vector2 = "x=2";

        var func = `
        function test(x) {
            let a = 0;
            let b = 1;
            if (x == 1) {
                while (x == 1) {
                    if (x == 2) {
                        x = x;
                    }
                    else if (x == 1) {
                        a = a;
                    }
                }
            }
            else {
                while (x == 2) {
                    if (x == 1) {
                        x = x;
                    }
                    else if (x == 2) {
                        a = a;
                    }
                }
            }
            return 3;
        }`
        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector2, _line);
        var groups = flower.code2groups(symbols, _container);
        flower.groups2diagram(groups)

        assert.equal(
            groups[0].name,
            'g1'
        );
    });

    it('Group return', () => {
        var input_vector2 = "x=2";

        var func = `
        function test(x) {
            let a = 0;
            let b = 1;
            if (x == 1) {
                while (x == 1) {
                    if (x == 2) {
                        x = x;
                    }
                    else if (x == 1) {
                        a = a;
                    }
                }
            }
            else {
                while (x == 2) {
                    if (x == 1) {
                        x = x;
                    }
                    else if (x == 2) {
                        a = a;
                    }
                }
            }
            return 3;
        }`
        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector2, _line);
        var groups = flower.code2groups(symbols, _container);

        assert.equal(
            flower.groupHasReturn(groups[3]),
            true
        );
    });

    it('Group isDivider', () => {
        var input_vector2 = "x=2";

        var func = `
        function test(x) {
            let a = 0;
            let b = 1;
            if (x == 1) {
                while (x == 1) {
                    if (x == 2) {
                        x = x;
                    }
                    else if (x == 1) {
                        a = a;
                    }
                }
            }
            else {
                while (x == 2) {
                    if (x == 1) {
                        x = x;
                    }
                    else if (x == 2) {
                        a = a;
                    }
                }
            }
            return 3;
        }`
        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);

        assert.equal(
            flower.isDivder(_container[4]),
            true
        );
    });

    it('Group removeUnnecessarySymbols', () => {
        var input_vector2 = "x=2";

        var func = `
        function test(x) {
            let a = 0;
            let b = 1;
            if (x == 1) {
                while (x == 1) {
                    if (x == 2) {
                        x = x;
                    }
                    else if (x == 1) {
                        a = a;
                    }
                }
            }
            else {
                while (x == 2) {
                    if (x == 1) {
                        x = x;
                    }
                    else if (x == 2) {
                        a = a;
                    }
                }
            }
            return 3;
        }`
        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var _removed = flower.removeUnnecessarySymbols(_container);

        assert.equal(
            _removed.length < _container.length,
            true
        );
    });

    it('Group GroupMembers #1', () => {
        var input_vector2 = "x=2";

        var func = `
        function test(x) {
            let a = 0;
            let b = 1;
            if (x == 1) {
                while (x == 1) {
                    if (x == 2) {
                        x = x;
                    }
                    else if (x == 1) {
                        a = a;
                    }
                }
            }
            else {
                while (x == 2) {
                    if (x == 1) {
                        x = x;
                    }
                    else if (x == 2) {
                        a = a;
                    }
                }
            }
            return 3;
        }`
        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector2, _line);
        var groups = flower.code2groups(symbols, _container);

        assert.equal(
           flower.groupMembers(groups[0]),
            '(1)\na = 0\nb = 1'
        );
    });

    it('Group GroupMembers #2', () => {
        var input_vector2 = "x=2";

        var func = `
        function test(x) {
            let a = 0;
            let b = 1;
            if (x == 1) {
                while (x == 1) {
                    if (x == 2) {
                        x = x;
                    }
                    else if (x == 1) {
                        a = a;
                    }
                }
            }
            else {
                while (x == 2) {
                    if (x == 1) {
                        x = x;
                    }
                    else if (x == 2) {
                        a = a;
                    }
                }
            }
            return 3;
        }`
        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector2, _line);
        var groups = flower.code2groups(symbols, _container);

        assert.equal(
           flower.groupMembers(groups[1]),
            '(2)\nx == 1'
        );
    });

    it('Group GroupMembers #3', () => {
        var input_vector2 = "x=1,y=2,z=3";

        var func = `
        function foo(x, y, z){
            let a = x + 1;
            let b = a + y;
            let c = 0;
            
            while (a < z) {
                c = a + b;
                z = c * 2;
                a++;
                z--;
            }
            
            return z;
         }
         `
        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector2, _line);
        var groups = flower.code2groups(symbols, _container);

        assert.equal(
           flower.groupMembers(groups[2]),
            '(4)\nreturn z'
        );
    });

    it('Group amount of childrens #1', () => {
        var input_vector2 = "x=2";

        var func = `
        function test(x) {
            let a = 0;
            let b = 1;
            if (x == 1) {
                while (x == 1) {
                    if (x == 2) {
                        x = x;
                    }
                    else if (x == 1) {
                        a = a;
                    }
                }
            }
            else {
                while (x == 2) {
                    if (x == 1) {
                        x = x;
                    }
                    else if (x == 2) {
                        a = a;
                    }
                }
            }
            return 3;
        }`
        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector2, _line);
        var groups = flower.code2groups(symbols, _container);

        assert.equal(
           groups[1].children.length.toString(),
            '1'
        );
    });

    it('Group amount of members #1', () => {
        var input_vector2 = "x=1";

        var func = `
        function test(x) {
            let a = 0;
            let b = 1;
            if (x == 1) {
                while (x == 1) {
                    if (x == 2) {
                        x = x;
                    }
                    else if (x == 1) {
                        a = a;
                    }
                }
            }
            else {
                while (x == 2) {
                    if (x == 1) {
                        x = x;
                    }
                    else if (x == 2) {
                        a = a;
                    }
                }
            }
            return 3;
        }`
        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector2, _line);
        var groups = flower.code2groups(symbols, _container);

        assert.equal(
           groups[0].members.length.toString(),
            '2'
        );
    });
});
