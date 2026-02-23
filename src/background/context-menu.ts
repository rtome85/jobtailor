import { STORAGE_KEYS } from "~storage/keys"

export async function createContextMenu() {
  await chrome.contextMenus.removeAll()

  chrome.contextMenus.create({
    id: "generateCV",
    title: "Generate CV for this job",
    contexts: ["selection", "page"]
  })

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "generateCV" && tab) {
      const selectedText = info.selectionText

      // Try to get job details from page via content script
      let prefillData = { companyName: "", jobTitle: "" }
      let jobDescription = selectedText?.trim() || ""

      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: "getSource"
        })
        if (response) {
          prefillData.companyName = response.companyName || ""
          prefillData.jobTitle = response.jobTitle || ""
          // If no text was selected, use scraped description
          if (!jobDescription && response.data) {
            jobDescription = response.data
          }
        }
      } catch (error) {
        // Content script may not be injected on non-LinkedIn pages
      }

      if (!jobDescription) {
        console.error("No job description found")
        return
      }

      chrome.storage.local.set({
        [STORAGE_KEYS.PENDING_JOB_DATA]: {
          selectedText: jobDescription,
          tabUrl: tab.url,
          tabId: tab.id,
          companyName: prefillData.companyName,
          jobTitle: prefillData.jobTitle
        }
      })

      chrome.windows.create({
        url: chrome.runtime.getURL("tabs/dialog.html"),
        type: "popup",
        width: 500,
        height: 440,
        focused: true
      })
    }
  })
}
