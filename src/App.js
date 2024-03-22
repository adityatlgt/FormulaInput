import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
const fetchAPI = async () => {
  const response = await fetch('https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};


function App() {
  const [value, setValue] = React.useState(null);
  const { data, isLoading, error } = useQuery('data', fetchAPI);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState([]);
  const [calculate, setCalculate] = useState([]);
  const [result, setResult] = useState()

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption((prev) => [...prev, option.name]);
    const flattenedArray = calculate.concat(option.value.toString());
    setCalculate((prev) => [...prev, option.value.toString()]);
    setIsOpen(false);
    const contentEditableDiv = document.getElementById('contentEditableDiv');
    const childNodes = contentEditableDiv.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      if (childNodes[i].nodeName !== 'SPAN') {
        contentEditableDiv.removeChild(childNodes[i]);
      }
    }
    const result = evaluateExpression(flattenedArray);
    setResult(result)
  };

  function setCursorToEnd(contentEditableElement) {
    var range, selection;
    if (document.createRange) { 
      range = document.createRange(); 
      range.selectNodeContents(contentEditableElement); 
      range.collapse(false); 
      selection = window.getSelection(); 
      selection.removeAllRanges();
      selection.addRange(range); 
    } else if (document.selection) { 
      range = document.body.createTextRange(); 
      range.moveToElementText(contentEditableElement);
      range.collapse(false); 
      range.select();
    }
  }

  const handleInputChange = (event) => {
    const operators = ['+', '-', '*', '(', ')', '^', '/']
    const dataUpdate = event.target.innerText.slice(-1);
    if (operators.includes(dataUpdate)) {
      const indexForoperator = operators.findIndex((item) => item === dataUpdate);
      const inputText = event.target.innerText;
      console.log(inputText)
      console.log(operators[indexForoperator])
      const contentEditableDiv = document.getElementById('contentEditableDiv');
      var innerHTML = contentEditableDiv.innerHTML;
      innerHTML = innerHTML.replace(/&nbsp;[+\-/*()^]/g, '&nbsp;');
      contentEditableDiv.innerHTML = innerHTML;
      var editableDiv = document.getElementById('contentEditableDiv');
      setTimeout(() => setCursorToEnd(editableDiv), 70);
      setSelectedOption((prev) => [...prev, operators[indexForoperator]])
      setCalculate((prev) => [...prev, operators[indexForoperator]]);
      return
    }
    if (selectedOption.length > 0) {
      const alreadyPresentData = selectedOption.join();
      debugger;
      const searchText = event.target.innerText.toLowerCase().slice(alreadyPresentData.length).trim();
      const filteredData = data.filter(option =>
        option.name.toLowerCase().includes(searchText)
      );
      setFilteredOptions(filteredData);
      toggleDropdown();
    }
    else {
      const searchText = event.target.innerText.toLowerCase();
      const filteredData = data.filter(option =>
        option.name.toLowerCase().includes(searchText)
      );
      setFilteredOptions(filteredData);
      toggleDropdown();
    }
  }

  function evaluateExpression(expression) {
    let result = parseFloat(expression[0]);
    for (let i = 1; i < expression.length; i += 2) {
      const operator = expression[i];
      const operand = parseFloat(expression[i + 1]);
      if (operator === '+') {
        result += operand;
      } else if (operator === '-') {
        result -= operand;
      } else if (operator === '*') {
        result *= operand;
      } else if (operator === '/') {
        result /= operand;
      }
    }
    return result;
  }

  return (
    <>
      <div style={{ marginLeft: '30%', fontSize: 18 }}>
        <b>Formula Implementation :</b>
        {calculate.map(item => <span style={{ marginLeft: 10 }}>{item}</span>)}
        = {result}
      </div>
      <div id="contentEditableDiv" onClick={toggleDropdown} tabIndex={0} contentEditable="true" onInput={handleInputChange}
        style={{
          marginLeft: 'auto', marginTop: '20%', paddingTop: 27,
          marginRight: 'auto', width: '50%', height: 51, border: '1px solid gray', borderRadius: '10px', paddingLeft: '10px'
        }}>
        {selectedOption.map((item, index) => <><span key={index} style={{ width: 'auto', height: 10, borderRadius: 8, marginRight: 2, backgroundColor: '#c3c3c3', border: '1px solid #7d7d7d', padding: 7 }}>{item}</span>&nbsp;</>)}
      </div>
      {isOpen && (
        <div style={{ marginLeft: '28%', marginTop: 5 }}>
          {filteredOptions.length === data.length || filteredOptions.length === 0 ?
            data.map((option, index) => (
              <div style={{ cursor: 'pointer' }} key={index} className="dropdown-option" onClick={() => handleOptionClick(option)}>
                {option.name}
              </div>
            )) : filteredOptions.map((option, index) => (
              <div key={index} style={{ cursor: 'pointer' }} className="dropdown-option" onClick={() => handleOptionClick(option)}>
                {option.name}
              </div>))}
        </div>
      )}
    </>
  );
}

export default App;