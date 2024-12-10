const itemsPerPage = 5;
let currentPage = 1;
let allGuestbookData = [];

const openPopup = document.getElementById("openPopup");
const closePopup = document.getElementById("closePopup");
const popup = document.getElementById("popup");
const popupForm = document.getElementById("popupForm");
const deletePopup = document.getElementById("deletePopup");
const closeDeletePopup = document.getElementById("closeDeletePopup");
const deleteForm = document.getElementById("deleteForm");
const deletePasswordField = document.getElementById("deletePassword");

const apiUrl = "/.netlify/functions/proxy";

function showElement(element) {
  element.classList.remove("hidden");
  element.style.display = "flex";
}

function hideElement(element) {
  element.classList.add("hidden");
  element.style.display = "none";
}

function resetDeletePasswordField() {
  deletePasswordField.value = "";
}

document.addEventListener("DOMContentLoaded", async () => {
  hideElement(deletePopup);
  hideElement(popup);
  await loadGuestbook();
});

openPopup.addEventListener("click", () => {
  showElement(popup);
});

closePopup.addEventListener("click", () => {
  hideElement(popup);
});

closeDeletePopup.addEventListener("click", () => {
  hideElement(deletePopup);
  resetDeletePasswordField();
});

async function loadGuestbook() {
  try {
    const response = await fetch(apiUrl, { method: "GET" });
    if (!response.ok) {
      throw new Error("Failed to fetch guestbook data.");
    }
    allGuestbookData = await response.json();
    renderPage(1);
    setupPagination();
  } catch (error) {
    console.error("Error loading guestbook data:", error);
  }
}

function renderPage(page) {
  currentPage = page;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = allGuestbookData.slice(startIndex, endIndex);

  const guestbook = document.getElementById("guestbook");
  guestbook.innerHTML = pageData
    .map(
      (entry) => `
      <div class="entry">
        <span class="delete-icon" data-id="${entry.id}" title="삭제">x</span>
        <strong>${entry.name}</strong>
        <div>${entry.message}</div>
        <small>${new Date(entry.timestamp).toLocaleString()}</small>
      </div>
    `
    )
    .join("");

  document.querySelectorAll(".delete-icon").forEach((icon) => {
    icon.addEventListener("click", (event) => {
      const id = event.target.dataset.id;
      openDeletePopup(id);
    });
  });
}

function openDeletePopup(id) {
  showElement(deletePopup);
  deleteForm.onsubmit = async (event) => {
    event.preventDefault();
    const password = deletePasswordField.value;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete", id, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to delete entry.");
      }

      alert("삭제되었습니다.");
      await loadGuestbook();
    } catch (error) {
      alert(error.message || "비밀번호가 일치하지 않습니다.");
    } finally {
      hideElement(deletePopup);
      resetDeletePasswordField();
    }
  };
}

popupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message").value;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "create", name, password, message }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit guestbook entry.");
    }

    alert("작성되었습니다.");
    popupForm.reset();
    hideElement(popup);
    await loadGuestbook();
  } catch (error) {
    alert("방명록 작성에 실패했습니다. 다시 시도해주세요.");
    console.error("Error submitting guestbook entry:", error);
  }
});

function setupPagination() {
  const totalPages = Math.ceil(allGuestbookData.length / itemsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("span");
    pageButton.textContent = i;
    pageButton.className = `page-number ${i === currentPage ? "active" : ""}`;
    pageButton.addEventListener("click", () => {
      renderPage(i);
      updatePagination(i);
    });
    pagination.appendChild(pageButton);
  }
}

function updatePagination(page) {
  const pageNumbers = document.querySelectorAll(".page-number");
  pageNumbers.forEach((btn, index) => {
    if (index + 1 === page) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}
