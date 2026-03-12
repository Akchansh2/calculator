
    const display  = document.getElementById('display');
    const exprEl   = document.getElementById('expr');

    let current  = '0';
    let expr     = '';
    let operator = null;
    let prev     = null;
    let freshResult = false;

    function updateDisplay(val) {
      // Shrink font for long numbers
      display.style.fontSize = val.length > 10 ? '1.6rem' : val.length > 7 ? '2rem' : '2.4rem';
      display.textContent = val;
    }

    function popAnim() {
      display.classList.remove('pop');
      void display.offsetWidth;
      display.classList.add('pop');
    }

    function inputNum(val) {
      if (freshResult) { current = ''; freshResult = false; }
      if (val === '.' && current.includes('.')) return;
      if (current === '0' && val !== '.') current = val;
      else current = (current || '') + val;
      updateDisplay(current);
    }

    function inputOp(op) {
      if (current === '' && prev !== null) { operator = op; exprEl.textContent = formatNum(prev) + ' ' + opSymbol(op); return; }
      if (prev !== null && current !== '' && operator) calculate();
      prev = parseFloat(current || prev);
      operator = op;
      exprEl.textContent = formatNum(prev) + ' ' + opSymbol(op);
      current = '';
      freshResult = false;
    }

    function calculate() {
      if (prev === null || current === '' || !operator) return;
      const a = prev, b = parseFloat(current);
      let result;
      switch (operator) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = b === 0 ? 'Error' : a / b; break;
        case '%': result = a % b; break;
        default: return;
      }

      const exprStr = formatNum(a) + ' ' + opSymbol(operator) + ' ' + formatNum(b);
      const resultStr = result === 'Error' ? 'Error' : formatNum(result);

      exprEl.textContent = exprStr + ' =';
      updateDisplay(resultStr);
      popAnim();



      prev = result === 'Error' ? null : result;
      current = result === 'Error' ? '0' : String(result);
      operator = null;
      freshResult = true;
    }

    function clearAll() {
      current = '0'; prev = null; operator = null; freshResult = false;
      exprEl.textContent = '';
      updateDisplay('0');
    }

    function del() {
      if (freshResult) { clearAll(); return; }
      current = current.slice(0, -1) || '0';
      updateDisplay(current);
    }

    function formatNum(n) {
      if (typeof n !== 'number') return n;
      const s = parseFloat(n.toFixed(10)).toString();
      return s;
    }

    function opSymbol(op) {
      return { '+':'+', '-':'−', '*':'×', '/':'÷', '%':'%' }[op] || op;
    }



    // BUTTON CLICKS
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', e => {
        // Ripple
        const r = document.createElement('span');
        r.className = 'ripple';
        const size = Math.max(btn.offsetWidth, btn.offsetHeight);
        const rect = btn.getBoundingClientRect();
        r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
        btn.appendChild(r);
        r.addEventListener('animationend', () => r.remove());

        const action = btn.dataset.action;
        const val    = btn.dataset.val;
        if (action === 'num') inputNum(val);
        else if (action === 'op') inputOp(val);
        else if (action === 'eq') calculate();
        else if (action === 'clear') clearAll();
        else if (action === 'del') del();
      });
    });

    // KEYBOARD
    document.addEventListener('keydown', e => {
      const key = e.key;
      if (key >= '0' && key <= '9') { highlight(key); inputNum(key); }
      else if (key === '.') { highlight('.'); inputNum('.'); }
      else if (key === '+') { highlight('+'); inputOp('+'); }
      else if (key === '-') { highlight('-'); inputOp('-'); }
      else if (key === '*') { highlight('*'); inputOp('*'); }
      else if (key === '/') { e.preventDefault(); highlight('/'); inputOp('/'); }
      else if (key === '%') { highlight('%'); inputOp('%'); }
      else if (key === 'Enter' || key === '=') { highlight('='); calculate(); }
      else if (key === 'Backspace') { highlight('⌫'); del(); }
      else if (key === 'Escape') { highlight('C'); clearAll(); }
    });

    function highlight(val) {
      const map = { '=':'[data-action="eq"]', 'C':'[data-action="clear"]', '⌫':'[data-action="del"]',
        '+':'[data-val="+"]', '-':'[data-val="-"]', '*':'[data-val="*"]', '/':'[data-val="/"]', '%':'[data-val="%"]' };
      const sel = map[val] || `[data-val="${val}"]`;
      const btn = document.querySelector(sel);
      if (btn) { btn.classList.add('pressed'); setTimeout(() => btn.classList.remove('pressed'), 120); }
    }
  
