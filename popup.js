document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("submitSnippetBtn")
    .addEventListener("click", saveSnippet);
  document
    .getElementById("addSnippetBtn")
    .addEventListener("click", () => showSnippetEditor());
  document
    .getElementById("searchBar")
    .addEventListener("keyup", searchSnippets);

  loadSnippets();
});

function createSnippetElement(name) {
  const snippetDiv = document.createElement("div");
  snippetDiv.className = "snippet";
  snippetDiv.style.cssText =
    "display: flex; justify-content: space-between; align-items: center;";

  const snippetNameSpan = document.createElement("span");
  snippetNameSpan.className = "snippetName";
  snippetNameSpan.dataset.name = name;
  snippetNameSpan.style.cssText =
    "cursor: pointer; text-decoration: underline; font-size:16px;";
  snippetNameSpan.textContent = name;

  const editButton = document.createElement("button");
  editButton.className = "editSnippetBtn";
  editButton.dataset.name = name;
  editButton.textContent = "Edit";

  const deleteButton = document.createElement("button");
  deleteButton.className = "deleteSnippetBtn";
  deleteButton.dataset.name = name;
  deleteButton.textContent = "Delete";

  const buttonContainer = document.createElement("div");
  buttonContainer.appendChild(editButton);
  buttonContainer.appendChild(deleteButton);

  snippetDiv.appendChild(snippetNameSpan);
  snippetDiv.appendChild(buttonContainer);

  return snippetDiv;
}

function loadSnippets() {
  chrome.storage.sync.get("snippets", (data) => {
    const snippetList = document.getElementById("snippetList");
    snippetList.innerHTML = "";
    const snippets = data.snippets || {};
    for (const name in snippets) {
      const snippetDiv = createSnippetElement(name);
      snippetList.appendChild(snippetDiv);
    }
    attachSnippetEventListeners();
  });
}

function attachSnippetEventListeners() {
  document.querySelectorAll(".snippetName").forEach((element) => {
    element.addEventListener("click", (event) => {
      copySnippet(event.target.dataset.name);
    });
  });

  document.querySelectorAll(".editSnippetBtn").forEach((element) => {
    element.addEventListener("click", (event) => {
      editSnippet(event.target.dataset.name);
    });
  });

  document.querySelectorAll(".deleteSnippetBtn").forEach((element) => {
    element.addEventListener("click", (event) => {
      deleteSnippet(event.target.dataset.name);
    });
  });
}

function showSnippetEditor(name = "", code = "") {
  document.getElementById("snippetName").value = name;
  document.getElementById("snippetCode").value = code;
  document.getElementById("originalSnippetName").value = name;
  document.getElementById("snippet").style.display = "block";
}

function hideSnippetEditor() {
  document.getElementById("snippet").style.display = "none";
}

function saveSnippet(event) {
  event.preventDefault();
  const name = document.getElementById("snippetName").value;
  const code = document.getElementById("snippetCode").value;
  const originalName = document.getElementById("originalSnippetName").value;

  chrome.storage.sync.get("snippets", (data) => {
    const snippets = data.snippets || {};

    if (name !== originalName && snippets[name]) {
      alert("Error: Snippet name already exists!");
      return; // Stop the function here
    }

    // If the original name is different, delete the old entry
    if (name !== originalName) {
      delete snippets[originalName];
    }

    snippets[name] = code;

    chrome.storage.sync.set(
      {
        snippets,
      },
      () => {
        alert("Snippet saved!");
        loadSnippets();
        hideSnippetEditor();
      }
    );
  });
}

function viewSnippet(name) {
  chrome.storage.sync.get("snippets", (data) => {
    const snippets = data.snippets || {};
    const code = snippets[name];
    alert(`Name: ${name}\nCode:\n${code}`);
  });
}

function editSnippet(name) {
  chrome.storage.sync.get("snippets", (data) => {
    const snippets = data.snippets || {};
    const code = snippets[name];
    showSnippetEditor(name, code);
  });
}

function deleteSnippet(name) {
  if (confirm("Are you sure you want to delete this snippet?")) {
    chrome.storage.sync.get("snippets", (data) => {
      const snippets = data.snippets || {};
      delete snippets[name];

      chrome.storage.sync.set(
        {
          snippets,
        },
        () => {
          alert("Snippet deleted!");
          loadSnippets();
        }
      );
    });
  }
}

function copySnippet(name) {
  chrome.storage.sync.get("snippets", (data) => {
    const snippets = data.snippets || {};
    const code = snippets[name];
    navigator.clipboard.writeText(code).then(() => {
      alert(`Snippet '${name}' copied to clipboard!`);
    });
  });
}

function searchSnippets() {
  const query = document.getElementById("searchBar").value.toLowerCase();
  chrome.storage.sync.get("snippets", (data) => {
    const snippetList = document.getElementById("snippetList");
    snippetList.innerHTML = "";
    const snippets = data.snippets || {};
    for (const name in snippets) {
      if (name.toLowerCase().includes(query)) {
        const snippetDiv = createSnippetElement(name);
        snippetList.appendChild(snippetDiv);
      }
    }
    attachSnippetEventListeners();
  });
}
