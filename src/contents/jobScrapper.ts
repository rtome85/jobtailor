import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.linkedin.com/*", "https://linkedin.com/*", "<all_urls>"],
  all_frames: false,
  run_at: "document_end"
}

function normalizeWhitespace(text: string | null | undefined): string {
  if (!text) return ""
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
}

function queryFirstMatch(selectors: string[]): string {
  for (const selector of selectors) {
    const el = document.querySelector(selector)
    const text = normalizeWhitespace(el?.textContent)
    if (text) return text
  }
  return ""
}

// Try to extract job data from JSON-LD structured data (most stable)
function extractFromJsonLd(): { companyName: string; jobTitle: string; description: string } | null {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]')
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || "")
      if (data["@type"] === "JobPosting") {
        return {
          companyName: data.hiringOrganization?.name || "",
          jobTitle: data.title || data.name || "",
          description: normalizeWhitespace(data.description || "")
        }
      }
    } catch {
      // ignore parse errors
    }
  }
  return null
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSource") {
    // 1st strategy: JSON-LD structured data
    const jsonLd = extractFromJsonLd()
    if (jsonLd && jsonLd.description) {
      sendResponse({
        data: jsonLd.description,
        companyName: jsonLd.companyName,
        jobTitle: jsonLd.jobTitle
      })
      return true
    }

    // 2nd strategy: data-* attributes
    const jobDescEl = document.querySelector(
      "[data-job-description], [data-testid='job-description']"
    )

    // 3rd strategy: CSS class selectors
    const jobElement =
      jobDescEl ||
      document.querySelector(
        ".jobs-description-content, .jobs-description__content, #job-details"
      )

    const companyName = queryFirstMatch([
      ".job-details-jobs-unified-top-card__company-name a",
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name a",
      ".jobs-unified-top-card__company-name",
      "[class*='company-name'] a",
      "[class*='company-name']"
    ])

    const jobTitle = queryFirstMatch([
      ".job-details-jobs-unified-top-card__job-title h1",
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title h1",
      ".jobs-unified-top-card__job-title",
      "h1.t-24",
      "h1[class*='job-title']"
    ])

    sendResponse({
      data: normalizeWhitespace(
        jobElement?.textContent || document.body.textContent
      ),
      companyName,
      jobTitle
    })
  }
  return true
})
