import $ from 'jquery';
import { parseCode } from './code-analyzer';
import parser from './parser';
import symbolizer from './symbolizer';
import flower from './flower';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let input_vector = $('#input_vector').val();

        parser.clearTable();
        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector, _line);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        symbolizer.print(symbols, codeToParse);

        var groups = flower.code2groups(symbols, _container);

        drawSVG(flower.groups2diagram(groups));
    });
});

function drawSVG(_code) {
    $('#diagram').html('');
    var diagram = flowchart.parse(_code);

    // you can also try to pass options:

    diagram.drawSVG('diagram', {
        'x': 0,'y': 0,'line-width': 2,'line-length': 50,'text-margin': 10,'font-size': 14,'font-color': 'black','line-color': 'black','element-color': 'black','fill': 'white','yes-text': 'yes','no-text': 'no','arrow-end': 'block','scale': 1,
        'symbols': {
            'start': {'font-color': 'red','element-color': 'green','fill': 'yellow'
            },'end': {'font-color': 'red','element-color': 'green','fill': 'yellow'}
        },
        'flowstate': {
            'false': { 'fill': '#a11616', 'font-size': 12, 'yes-text': 'F', 'no-text': 'T', 'font-color': 'white' },'true': { 'fill': '#22a116', 'font-size': 12, 'yes-text': 'T', 'no-text': 'F', 'font-color': 'white' }
        }
    });
}

function print(_html) {
    document.getElementById('sol').style.display = 'table';
    document.getElementById('outputTable').innerHTML = _html;
}

function printSymbols(symbols) {
    var _html = '';
    var _inputToPrint = symbolizer._getInput().map(i => i.key + '=' + i.value).join(', ');
    _html += `<tr><td> ${_inputToPrint} </td></tr>`;
    symbols.forEach(symbol => {
        _html += `<tr><td style='background:${symbol.color}'> ${symbol.html} </td></tr>`;
    });

    $('#symbolizedCode').html(_html);
}