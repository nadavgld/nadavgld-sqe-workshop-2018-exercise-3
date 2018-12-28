var _symbols, _parsedCode, _groups, _numOfGroups;
import symbolizer from './symbolizer';

function code2groups(symbols, parsedCode) {
    _init();
    _symbols = symbols;
    _parsedCode = parsedCode;

    _parsedCode = removeUnnecessarySymbols(_parsedCode);
    divideToGroups(_parsedCode, _groups);
    // nestGroups();

    return _groups;
}

function _init() {
    _symbols = [];
    _parsedCode = [];
    _groups = [];
    _numOfGroups = 0;
}

function calculateChildren(code) {
    for (var i = code.length - 1; i >= 0; i--) {
        var _line = code[i];
        var _parent = code.find(l => l === _line.parent);

        if (_parent !== undefined) {
            _parent.children = _parent.children === undefined || _parent.children.length == 0 ? [] : _parent.children;
            _parent.children.unshift(_line);
        }
    }

    code.forEach(c => {
        if (c.children === undefined)
            c.children = [];
    });
    code = filterChilds(code);
    return code;
}

function filterChilds(code) {
    for (var i = code.length - 1; i >= 0; i--) {
        var childs = code[i].children;

        if (childs != undefined && childs.length > 0)
            code = _filterChilds(code, childs);
    }

    return code;
}

function _filterChilds(code, childs) {
    for (var i = childs.length - 1; i >= 0; i--) {
        code = code.filter(c => {
            return c.line != childs[i].line;
        });
    }

    return code;
}

function removeUnnecessarySymbols(code) {
    var _tmpCode = [];

    code.forEach(line => {
        if (line.type != 'function declaration') {
            if (line.type == 'variable declaration' && isParam(line, _parsedCode)) {
                return;
            } else {
                _tmpCode.push(line);
            }
        }
    });
    code = calculateChildren(_tmpCode);
    return code;
}

function divideToGroups(code, groups) {
    var _srcCode = code;
    var _srcGroups = groups;
    var currentGroup = null;

    for (var i = 0; i < _srcCode.length; i++) {
        var _obj = _srcCode[i];

        if (currentGroup == null) {
            _numOfGroups++;
            currentGroup = { members: [], result: true, children: [], type: 'operation', name: 'g' + _numOfGroups };
        }

        currentGroup = insertObjectToGroup(_obj, currentGroup, _srcGroups);
    }

    if (currentGroup != null)
        _srcGroups.push(currentGroup);
}

function insertObjectToGroup(obj, group, _srcGroups) {
    if (!isDivder(obj)) { group.members.push(obj); }
    else {
        if (group.members.length != 0) {
            _srcGroups.push(group);
            _numOfGroups++;
        }
        group = createNewGroup(obj);
        // if (group === undefined) {
        //     _numOfGroups++;
        //     return null;
        // }
        group.members.push(obj);
        divideToGroups(obj.children, group.children);
        // if (group.members.length != 0)
        _srcGroups.push(group);
        return null;
    }
    return group;
}

function createNewGroup(obj) {
    var _group = { members: [], children: [], name: 'g' + _numOfGroups };
    if (obj.type == 'return statement') {
        _group.result = true;
        _group.type = 'operation';
        obj.value = 'return ' + obj.value;
    } else if (obj.type == 'else statement') {
        obj.condition = 'else';
        _group.result = /*setResult*/(_symbols.find(s => s.line == obj.line).result);
        _group.type = 'start';
    }
    else {
        _group.result = /*setResult*/(_symbols.find(s => s.line == obj.line).result);
        _group.type = 'condition';
    }

    return _group;
}

// function setResult(res) {
//     if (res === undefined)
//         return true;
//     return res;
// }

function isDivder(obj) {
    return obj.type == 'if statement' || obj.type == 'else if statement' || obj.type == 'else statement' || obj.type == 'while statement' || obj.type == 'return statement';
}

// function isCondition(obj) {
//     return obj.type == 'if statement' || obj.type == 'else if statement' || obj.type == 'else statement';
// }

function isParam(obj, table) {
    return symbolizer.isParam(obj, table);
}

// -------------------------- DRAWING GROUPS

function groups2diagram(groups) {
    var _diagram = 'st=>start: Start\ne=>end: End';
    var _sequence = '';
    var _prev = { name: 'st', type: 'operation' };

    var { diagram, sequence, prev } = convertGroupsToData(groups, _prev, _sequence, _diagram);

    _diagram = diagram + '\n';
    _sequence += sequence + prev.name + '->e';

    return _diagram + '\n' + _sequence;
}

function convertGroupsToData(groups, prev, sequence, diagram) {
    var initResult = true;
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        initResult = group.type == 'operation' ? true : initResult;
        var { _txt, _result } = getGroupFlow(group, initResult);

        diagram += '\n' + _txt;

        if (prev.type == 'operation')
            sequence += prev.name + '->' + group.name + '\n';
        else {
            sequence += addSequenceToCondtion(prev, group, getNextGroup(groups, i));
        }
        initResult = _result;
        prev = group;
    }

    return { diagram, sequence, prev };
}

function addSequenceToCondtion(prevGroup, currentGroup, originCurrent) {
    var _seq = '', _prev, _curr;
    _seq += updateSequence(prevGroup, currentGroup);

    for (var i = 1; i <= prevGroup.children.length; i++) {
        _prev = prevGroup.children[i - 1];
        _curr = prevGroup.children[i];

        if (_curr === undefined) {
            if (prevGroup.members[0].type == 'while statement') {
                _curr = prevGroup;
            } else if (prevGroup.members[0].condition == 'else')
                _curr = currentGroup;
            else
                _curr = originCurrent;
        }
        _seq += addSequenceToCondtion(_prev, _curr, originCurrent);
    }
    return _seq;
}

function updateSequence(prevGroup, currentGroup) {
    var _seq = '';

    if (prevGroup.members[0].condition == 'else')
        // _seq += prevGroup.name + '->' + prevGroup.children[0].name + '->' + currentGroup.name + '\n';
        _seq += prevGroup.name + '->' + prevGroup.children[0].name + '\n';
    // else if (prevGroup.members[0].type == 'while statement')
    // _seq += prevGroup.name + '(yes,no)->' + prevGroup.children[0].name + '\n';
    else if (prevGroup.type == 'condition')
        _seq += prevGroup.name + '(yes)->' + prevGroup.children[0].name + '\n' + prevGroup.name + '(no)->' + currentGroup.name + '\n';
    else
        _seq += prevGroup.name + '->' + currentGroup.name + '\n';

    return _seq;
}

function getNextGroup(groups, indx) {
    for (var i = indx + 1; i < groups.length; i++) {
        const _member = groups[i].members[0];
        if (_member.type !== 'else statement' && _member.type !== 'else if statement')
            return groups[i];
    }

    return groups[indx];
}

function getGroupFlow(group, result) {
    var prevResult = group.result && result, resultToReturn, childResult;

    var txt = group.name + '=>' + group.type + ': ' + groupMembers(group) + ' | ' + result + '\n';

    childResult = prevResult;
    group.children.forEach(child => {
        var { _txt, _result } = getGroupFlow(child, childResult);
        childResult = _result;
        txt += _txt;
    });

    if (group.type == 'condition' && prevResult === true && group.members[0].type != 'while statement')
        resultToReturn = !prevResult;
    else
        resultToReturn = result;

    return { _txt: txt, _result: resultToReturn };
}

function groupMembers(group) {
    var _groupNum = '(' + group.name.split('g')[1] + ')\n';
    if (groupHasReturn(group))
        return _groupNum + group.members[0].value;

    if (group.type == 'operation')
        return _groupNum + group.members.map(m => m.name + ' = ' + m.value).join('\n');

    return _groupNum + group.members[0].condition;
}

function groupHasReturn(group) {
    for (var i = 0; i < group.members.length; i++) {
        if (group.members[i].type == 'return statement')
            return true;
    }

    return false;
}


export default { code2groups, groups2diagram, isDivder, groupHasReturn, removeUnnecessarySymbols, groupMembers };