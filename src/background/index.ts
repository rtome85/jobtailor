import { createContextMenu } from "~background/context-menu"

chrome.runtime.onInstalled.addListener(async () => {
  await createContextMenu()
})

// Re-create context menu on startup (service worker restart)
chrome.runtime.onStartup.addListener(async () => {
  await createContextMenu()
})
