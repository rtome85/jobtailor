import type { PlasmoMessaging } from "@plasmohq/messaging"

import { OllamaClient } from "~api/ollamaClient"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { apiKey, baseUrl } = req.body

  if (!apiKey) {
    res.send({ success: false, message: "Please enter API key first" })
    return
  }

  try {
    const client = new OllamaClient({ apiKey, baseUrl, enabled: true })
    const success = await client.testConnection()

    if (success) {
      res.send({
        success: true,
        message: "Connection successful! Your API key is valid."
      })
    } else {
      res.send({
        success: false,
        message: "Connection failed. Please check your API key."
      })
    }
  } catch (error) {
    res.send({
      success: false,
      message: "Connection failed. Please check your internet connection."
    })
  }
}

export default handler
