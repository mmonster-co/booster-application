"use client"

import { useEffect, useState } from "react"
import { FormSection, FormButtons, Alert } from "../ui-components"
import { getDiscordAuthUrl } from "@/lib/discord-auth"
import { useSearchParams } from "next/navigation"
import type { FormData, DiscordUser } from "../booster-application-form"

interface DiscordAuthStepProps {
  onContinue: () => void
  onBack: () => void
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
}

export function DiscordAuthStep({ onContinue, onBack, formData, updateFormData }: DiscordAuthStepProps) {
  const [discordAuthUrl, setDiscordAuthUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configError, setConfigError] = useState<boolean>(false)
  const searchParams = useSearchParams()

  // Get Discord user data from URL if available
  const discordUserParam = searchParams.get("discord_user")
  const errorParam = searchParams.get("error")

  useEffect(() => {
    // Initialize the Discord auth URL
    async function loadAuthUrl() {
      try {
        const url = await getDiscordAuthUrl()
        setDiscordAuthUrl(url)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to get Discord auth URL:", error)
        setError(error instanceof Error ? error.message : "Failed to initialize Discord authentication")
        setConfigError(true)
        setIsLoading(false)
      }
    }

    loadAuthUrl()

    // Handle error from callback
    if (errorParam) {
      setError(decodeURIComponent(errorParam))

      // Clean up the URL
      const url = new URL(window.location.href)
      url.searchParams.delete("error")
      window.history.replaceState({}, "", url)
    }

    // Handle successful Discord authentication
    if (discordUserParam) {
      try {
        const discordUser = JSON.parse(decodeURIComponent(discordUserParam)) as DiscordUser

        // Update form data with Discord user information
        updateFormData({
          discordId: discordUser.fullDiscordTag,
          discordUser: discordUser,
        })

        // Clean up the URL
        const url = new URL(window.location.href)
        url.searchParams.delete("discord_user")
        window.history.replaceState({}, "", url)

        // Automatically proceed to the next step (Discord verification success)
        onContinue()
      } catch (e) {
        console.error("Error parsing Discord user data:", e)
        setError("Failed to process Discord authentication data")
      }
    }
  }, [discordUserParam, errorParam, updateFormData, onContinue])

  const handleDiscordAuth = () => {
    if (discordAuthUrl) {
      // Store the current URL to return to after authentication
      sessionStorage.setItem("discordAuthReturnUrl", window.location.href)
      window.location.href = discordAuthUrl
    } else {
      setError("Discord authentication URL is not available. Please try again later.")
    }
  }

  return (
    <FormSection
      title="Discord Authentication"
      description="We require authentication with your Discord account. This helps us verify your identity and communicate with you throughout the application process."
    >
      {error && (
        <Alert type="error">
          <p>Authentication error: {error}</p>
        </Alert>
      )}

      <div className="mt-8 bg-[#1E2533] rounded-md p-6">
        <h3 className="text-center text-lg font-medium mb-4">Connect Your Discord Account</h3>
        <p className="text-center text-gray-400 text-sm mb-6">
          Click the button below to securely authenticate with Discord. We'll only access your basic profile
          information.
        </p>
        <button
          onClick={handleDiscordAuth}
          disabled={isLoading || !discordAuthUrl || configError}
          className="w-full py-3 bg-[#5865F2] text-white rounded-md hover:bg-[#5865F2]/90 transition-colors flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </>
          ) : configError ? (
            "Discord configuration error"
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 71 55"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2"
              >
                <path
                  d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"
                  fill="currentColor"
                />
              </svg>
              Connect with Discord
            </>
          )}
        </button>

        <div className="flex items-center justify-center my-4">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="mx-4 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3 bg-transparent border border-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Continue without Discord authentication
        </button>
      </div>

      <FormButtons onContinue={onContinue} onBack={onBack} />
    </FormSection>
  )
}
