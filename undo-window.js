(function (root, factory) {
  const createMoveUndoWindow = factory();
  if (typeof module === 'object' && module.exports) module.exports = createMoveUndoWindow;
  root.createMoveUndoWindow = createMoveUndoWindow;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  return function createMoveUndoWindow({element, onCommit, onUndo, duration = 20000}) {
    const label = element.querySelector('[data-undo-label]');
    const seconds = element.querySelector('[data-undo-seconds]');
    const bar = element.querySelector('[data-undo-bar]');
    const button = element.querySelector('[data-undo-button]');
    let pending = null;
    let tickTimer = null;
    let deadlineTimer = null;
    let hideTimer = null;

    function stopTimers() {
      clearInterval(tickTimer);
      clearTimeout(deadlineTimer);
      tickTimer = null;
      deadlineTimer = null;
    }

    function hide(dust) {
      clearTimeout(hideTimer);
      if (!dust) {
        element.hidden = true;
        element.classList.remove('is-dusting');
        return;
      }
      element.classList.add('is-dusting');
      hideTimer = setTimeout(() => {
        element.hidden = true;
        element.classList.remove('is-dusting');
      }, 720);
    }

    function update() {
      if (!pending) return;
      const remaining = Math.max(0, pending.deadline - Date.now());
      const percent = Math.max(0, Math.min(100, remaining / duration * 100));
      seconds.textContent = `${Math.ceil(remaining / 1000)}s`;
      bar.style.transform = `scaleX(${percent / 100})`;
      bar.setAttribute('aria-valuenow', String(Math.round(percent)));
      if (remaining === 0) commit();
    }

    function commit({dust = true} = {}) {
      if (!pending) return false;
      const move = pending.move;
      pending = null;
      stopTimers();
      onCommit(move);
      hide(dust);
      return true;
    }

    function undo() {
      if (!pending) return false;
      const move = pending.move;
      pending = null;
      stopTimers();
      onUndo(move);
      hide(false);
      return true;
    }

    function cancel() {
      pending = null;
      stopTimers();
      hide(false);
    }

    function begin(move) {
      commit({dust: false});
      clearTimeout(hideTimer);
      element.classList.remove('is-dusting');
      pending = {move, deadline: Date.now() + duration};
      label.textContent = `${move.name}: ${move.from} → ${move.to}`;
      element.hidden = false;
      update();
      tickTimer = setInterval(update, 100);
      deadlineTimer = setTimeout(() => commit(), duration);
    }

    button.addEventListener('click', undo);
    return {begin, commit, undo, cancel, getPending: () => pending?.move ?? null};
  };
});
