(function () {
  "use strict";

  var STORAGE_KEY = "dsh-demo.todos.v1";
  var FILTERS = ["all", "active", "completed"];

  var form = document.getElementById("todo-form");
  var input = document.getElementById("todo-input");
  var list = document.getElementById("todo-list");
  var empty = document.getElementById("empty");
  var emptyTitle = document.getElementById("empty-title");
  var emptyHint = document.getElementById("empty-hint");
  var remaining = document.getElementById("remaining");
  var badge = document.getElementById("remaining-badge");
  var clearCompleted = document.getElementById("clear-completed");
  var today = document.getElementById("today");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var template = document.getElementById("todo-item-template");

  var state = {
    todos: loadTodos(),
    filter: "all",
  };

  var enteringId = null;

  function loadTodos() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(function (todo) {
          return todo && typeof todo.id === "string" && typeof todo.title === "string";
        })
        .map(function (todo) {
          return {
            id: todo.id,
            title: todo.title.slice(0, 200),
            done: todo.done === true,
          };
        });
    } catch (error) {
      return [];
    }
  }

  function saveTodos() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
    } catch (error) {
      // Storage can be full or blocked (private mode); the page still works in memory.
    }
  }

  function createId() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function findTodo(id) {
    for (var i = 0; i < state.todos.length; i += 1) {
      if (state.todos[i].id === id) return state.todos[i];
    }
    return null;
  }

  function visibleTodos() {
    if (state.filter === "active") {
      return state.todos.filter(function (todo) {
        return !todo.done;
      });
    }
    if (state.filter === "completed") {
      return state.todos.filter(function (todo) {
        return todo.done;
      });
    }
    return state.todos;
  }

  function updateFilterButtons() {
    filterButtons.forEach(function (button) {
      var active = button.dataset.filter === state.filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function render() {
    var todos = visibleTodos();
    var doneCount = state.todos.filter(function (todo) {
      return todo.done;
    }).length;
    var openCount = state.todos.length - doneCount;

    list.textContent = "";
    todos.forEach(function (todo) {
      var item = template.content.firstElementChild.cloneNode(true);
      item.dataset.id = todo.id;
      item.classList.toggle("is-done", todo.done);
      if (todo.id === enteringId) item.classList.add("is-entering");

      var check = item.querySelector(".todo-check");
      check.setAttribute("aria-checked", String(todo.done));
      check.setAttribute(
        "aria-label",
        (todo.done ? "标记「" : "完成「") + todo.title + (todo.done ? "」为未完成" : "」")
      );

      item.querySelector(".todo-text").textContent = todo.title;

      var remove = item.querySelector(".todo-delete");
      remove.setAttribute("aria-label", "删除「" + todo.title + "」");

      list.appendChild(item);
    });
    enteringId = null;

    var nothingVisible = todos.length === 0;
    empty.hidden = !nothingVisible;
    list.hidden = nothingVisible;
    if (nothingVisible) {
      if (state.filter === "active") {
        emptyTitle.textContent = "没有进行中的待办";
        emptyHint.textContent = "所有事项都完成了，休息一下吧";
      } else if (state.filter === "completed") {
        emptyTitle.textContent = "还没有已完成的事项";
        emptyHint.textContent = "完成一项待办后会显示在这里";
      } else {
        emptyTitle.textContent = "还没有待办";
        emptyHint.textContent = "在上方输入框写下第一件事吧";
      }
    }

    remaining.textContent = "剩余 " + openCount + " 项";
    badge.textContent = String(openCount);
    clearCompleted.disabled = doneCount === 0;
    updateFilterButtons();
  }

  function addTodo(title) {
    var todo = { id: createId(), title: title, done: false };
    state.todos.unshift(todo);
    enteringId = todo.id;
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    var todo = findTodo(id);
    if (!todo) return;
    todo.done = !todo.done;
    saveTodos();
    render();
  }

  function removeTodo(id) {
    state.todos = state.todos.filter(function (todo) {
      return todo.id !== id;
    });
    saveTodos();
    render();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var title = input.value.trim();
    if (!title) {
      input.focus();
      return;
    }
    addTodo(title);
    input.value = "";
    input.focus();
  });

  list.addEventListener("click", function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    var item = target.closest(".todo-item");
    if (!item) return;
    if (target.closest(".todo-check")) {
      toggleTodo(item.dataset.id);
    } else if (target.closest(".todo-delete")) {
      removeTodo(item.dataset.id);
    }
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.dataset.filter;
      if (FILTERS.indexOf(filter) === -1 || filter === state.filter) return;
      state.filter = filter;
      render();
    });
  });

  clearCompleted.addEventListener("click", function () {
    if (!state.todos.some(function (todo) { return todo.done; })) return;
    state.todos = state.todos.filter(function (todo) {
      return !todo.done;
    });
    saveTodos();
    render();
  });

  window.addEventListener("storage", function (event) {
    if (event.key !== STORAGE_KEY) return;
    state.todos = loadTodos();
    render();
  });

  today.textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  render();
})();
