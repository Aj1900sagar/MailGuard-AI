
document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. DOM ELEMENTS
  // ==========================================

  const $ = (selector) => document.querySelector(selector);

  const form = $("#spamForm");
  const subjectInput = $("#subject");
  const messageInput = $("#message");

  const analyzeBtn = $("#analyzeBtn");
  const buttonText = $("#buttonText");
  const buttonIcon = $("#buttonIcon");

  const formError = $("#formError");
  const charCount = $("#charCount");

  const emptyState = $("#emptyState");
  const loadingState = $("#loadingState");
  const resultState = $("#resultState");

  const resultIcon = $("#resultIcon");
  const resultTitle = $("#resultTitle");
  const resultDescription = $("#resultDescription");

  const probabilityValue = $("#probabilityValue");
  const probabilityBar = $("#probabilityBar");

  const apiStatus = $("#apiStatus");

  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  const clearBtn = $("#clearBtn");
  const resetResultBtn = $("#resetResult");

  let requestInProgress = false;

  // ==========================================
  // 2. CHECK REQUIRED HTML ELEMENTS
  // ==========================================

  const requiredElements = {
    spamForm: form,
    subject: subjectInput,
    message: messageInput,
    analyzeBtn,
    buttonText,
    buttonIcon,
    formError,
    emptyState,
    loadingState,
    resultState,
    resultIcon,
    resultTitle,
    resultDescription,
    probabilityValue,
    probabilityBar,
  };

  const missingElements = Object.entries(requiredElements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error(
      "MailGuard AI: Missing HTML elements:",
      missingElements
    );

    console.error(
      "Check whether the IDs in index.html match the selectors in script.js."
    );

    return;
  }

  // ==========================================
  // 3. FOOTER YEAR
  // ==========================================

  const currentYear = $("#currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // ==========================================
  // 4. MOBILE NAVIGATION
  // ==========================================

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");

        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      if (
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        navLinks.classList.remove("open");

        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ==========================================
  // 5. ACTIVE NAVIGATION SECTION
  // ==========================================

  const sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") ===
                `#${entry.target.id}`
            );
          });
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // ==========================================
  // 6. CHARACTER COUNTER
  // ==========================================

  function updateCharacterCount() {
    if (!charCount) return;

    charCount.textContent =
      `${messageInput.value.length.toLocaleString()} / 20,000`;
  }

  messageInput.addEventListener(
    "input",
    updateCharacterCount
  );

  // ==========================================
  // 7. ERROR HANDLING
  // ==========================================

  function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
  }

  function clearError() {
    formError.textContent = "";
    formError.hidden = true;
  }

  // ==========================================
  // 8. RESULT STATES
  // ==========================================

  function showState(state) {
    emptyState.hidden = state !== "empty";
    loadingState.hidden = state !== "loading";
    resultState.hidden = state !== "result";
  }

  function setLoading(isLoading) {
    requestInProgress = isLoading;

    analyzeBtn.disabled = isLoading;

    analyzeBtn.style.opacity = isLoading
      ? "0.75"
      : "1";

    analyzeBtn.style.cursor = isLoading
      ? "wait"
      : "pointer";

    buttonText.textContent = isLoading
      ? "Analyzing email..."
      : "Analyze email";

    buttonIcon.textContent = isLoading
      ? "..."
      : "↗";
  }

  // ==========================================
  // 9. API HEALTH CHECK
  // ==========================================

  async function checkApiHealth() {
    if (!apiStatus) return;

    const statusDot = apiStatus.previousElementSibling;

    try {
      const response = await fetch("/health", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Health check failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.model_loaded === false) {
        apiStatus.textContent = "Model not loaded";

        if (statusDot) {
          statusDot.classList.add("offline");
        }

        return;
      }

      apiStatus.textContent = "Model connection ready";

      if (statusDot) {
        statusDot.classList.remove("offline");
      }
    } catch (error) {
      console.error("API health check failed:", error);

      apiStatus.textContent = "API connection unavailable";

      if (statusDot) {
        statusDot.classList.add("offline");
      }
    }
  }

  checkApiHealth();

  // ==========================================
  // 10. READ SPAM PROBABILITY
  // ==========================================

  function readSpamProbability(data) {
    const rawValue = Number(data.spam_probability);

    if (!Number.isFinite(rawValue)) {
      throw new Error(
        "The API did not return a valid spam probability."
      );
    }

    // Supports either decimal probability (0 to 1)
    // or percentage (0 to 100).
    const percentage =
      rawValue >= 0 && rawValue <= 1
        ? rawValue * 100
        : rawValue;

    if (percentage < 0 || percentage > 100) {
      throw new Error(
        "The API returned an invalid probability value."
      );
    }

    return percentage;
  }

  // ==========================================
  // 11. DISPLAY PREDICTION RESULT
  // ==========================================

  function displayResult(data) {
    const rawLabel = String(
      data.label ?? data.prediction ?? ""
    ).trim().toLowerCase();

    if (!rawLabel) {
      throw new Error(
        "The API response is missing the prediction label."
      );
    }

    // Prefer the explicit Boolean returned by Flask.
    const isSpam =
      typeof data.is_spam === "boolean"
        ? data.is_spam
        : (
            rawLabel === "spam" ||
            rawLabel === "likely spam" ||
            rawLabel === "1"
          );

    const spamProbability = readSpamProbability(data);

    resultState.classList.toggle("is-spam", isSpam);

    resultIcon.textContent = isSpam ? "!" : "✓";

    resultTitle.textContent = isSpam
      ? "Likely Spam"
      : "Not Spam";

    resultDescription.textContent = isSpam
      ? "The model classified this email as spam. Check the sender, links, and requests carefully."
      : "The model classified this email as not spam. Always verify suspicious senders and links.";

    probabilityValue.textContent =
      `${spamProbability.toFixed(1)}%`;

    probabilityBar.style.width = "0%";

    showState("result");

    // Animate probability bar.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        probabilityBar.style.width =
          `${spamProbability}%`;
      });
    });

    if (apiStatus) {
      apiStatus.textContent = "Analysis complete";

      const statusDot = apiStatus.previousElementSibling;

      if (statusDot) {
        statusDot.classList.remove("offline");
      }
    }
  }

  // ==========================================
  // 12. SUBMIT EMAIL TO DISTILBERT API
  // ==========================================

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (requestInProgress) return;

    clearError();

    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();

    if (!subject && !message) {
      showError(
        "Please enter an email subject or message."
      );

      subjectInput.focus();
      return;
    }

    if (message.length + subject.length > 20000) {
      showError(
        "Your email is too long. Please keep it under 20,000 characters."
      );

      return;
    }

    setLoading(true);
    showState("loading");

    try {
      console.log("MailGuard AI: Sending email for analysis...");

      const response = await fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject,
          message: message,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Check the Flask terminal."
        );
      }

      console.log("MailGuard AI API response:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          `Prediction request failed (${response.status}).`
        );
      }

      displayResult(data);

      console.log(
        "MailGuard AI: Prediction displayed successfully."
      );
    } catch (error) {
      console.error(
        "MailGuard AI prediction error:",
        error
      );

      showState("empty");

      const errorText =
        error instanceof TypeError
          ? "Unable to connect to the prediction API. Make sure Flask is running and the website is opened through the Flask server."
          : error.message ||
            "Something went wrong. Please try again.";

      showError(errorText);

      checkApiHealth();
    } finally {
      setLoading(false);
    }
  });

  // ==========================================
  // 13. RESET UI HELPER
  // ==========================================

  function resetInterface() {
    if (requestInProgress) return;

    form.reset();

    updateCharacterCount();
    clearError();

    probabilityBar.style.width = "0%";

    resultState.classList.remove("is-spam");

    showState("empty");
  }

  // ==========================================
  // 14. CLEAR EMAIL
  // ==========================================

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      resetInterface();
      messageInput.focus();
    });
  }

  // ==========================================
  // 15. ANALYZE ANOTHER EMAIL
  // ==========================================

  if (resetResultBtn) {
    resetResultBtn.addEventListener("click", () => {
      resetInterface();
      subjectInput.focus();
    });
  }

  // ==========================================
  // 16. INITIAL UI
  // ==========================================

  updateCharacterCount();
  showState("empty");

  console.log(
    "MailGuard AI initialized successfully."
  );
});
