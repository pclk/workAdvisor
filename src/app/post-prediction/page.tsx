'use client';

import React, { useState } from "react";

export default function PostPredictionPage() {
  const [textInput, setTextInput] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [category, setCategory] = useState("A Level");
  const [llmResponse, setLlmResponse] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false); // New loading state

  const handlePrediction = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await fetch("https://validate-post-78306345447.asia-southeast1.run.app/validate_post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textInput, title: postTitle, category}),
      });

      if (response.ok) {
        const data = await response.json();
        const { ridiculous, leaks_pii, relevant_to_category } = data.result;

        if (!ridiculous && !leaks_pii && relevant_to_category) {
          const predictionResponse = await fetch("https://post-validation-78306345447.asia-southeast1.run.app/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_content: textInput, post_title: postTitle, category }),
          });

          if (predictionResponse.ok) {
            const predictionData = await predictionResponse.json();
            setAnalysisResult(predictionData);
          } else {
            const error = await predictionResponse.json();
            console.error("Error with prediction:", error.error);
            setLlmResponse(`Error with prediction: ${error.error}`);
          }
        } else {
          setAnalysisResult(null);
        }
        setLlmResponse(data.response);
      } else {
        const error = await response.json();
        console.error("Error:", error.error);
        setLlmResponse(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
      setLlmResponse("Error connecting to the server.");
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
  const formatLlmResponse = (response: string) => {
    // 1. Bold formatting for text enclosed in **
    let formattedResponse = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // 2. Convert URLs into clickable links
    formattedResponse = formattedResponse.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline">$1</a>'
    );

    // 3. Add new lines when '-' is detected (indicating bullet points)
    formattedResponse = formattedResponse.replace(/- /g, "<br>• ");

    return formattedResponse;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="loader mb-4"></div> {/* Spinner */}
            <p className="text-lg font-semibold">Processing your request...</p>
          </div>
        </div>
      )}

      {/* Title Section */}
      <div className="text-center py-8 bg-gray-800 rounded-xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold">Post Prediction and Analysis</h1>
        <p className="mt-2 text-lg">Enter post content and title to predict category and analyze its validity</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Section */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Post Prediction</h2>
          <form onSubmit={handlePrediction} className="space-y-4">
            <div>
              <label htmlFor="category-select" className="block text-sm font-medium mb-1">Select Category</label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                disabled={loading} // Disable during loading
              >
                <option value="A Level">A Level</option>
                <option value="GCSE">GCSE</option>
                <option value="Job Experience">Job Experience</option>
                <option value="Study Support">Study Support</option>
              </select>
            </div>

            <div>
              <label htmlFor="post-title" className="block text-sm font-medium mb-1">Enter Post Title</label>
              <input
                type="text"
                id="post-title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Enter your post title here"
                required
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                disabled={loading} // Disable during loading
              />
            </div>

            <div>
              <label htmlFor="text-input" className="block text-sm font-medium mb-1">Enter Post Content</label>
              <textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your post content here"
                required
                className="w-full p-2 h-32 rounded-lg bg-gray-700 border border-gray-600"
                disabled={loading} // Disable during loading
              />
            </div>

            <button
              type="submit"
              className={`w-full text-white font-medium py-2 px-4 rounded-lg ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={loading} // Disable button during loading
            >
              {loading ? "Validating..." : "Validate Post"}
            </button>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Analysis Result</h2>
          {analysisResult ? (
            <div className="space-y-4">
              {analysisResult.predictions.map((prediction: any, index: number) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-md flex justify-between items-center">
                  <p className="text-sm text-gray-300">Day {prediction.days_since_post}:</p>
                  <p className="text-lg font-semibold text-green-400">{prediction.predicted_class}</p>
                </div>
              ))}
              {analysisResult.predictions.find((p: any) => p.days_since_post === 7) && (
                <div className="mt-4 p-4 bg-blue-600 text-white rounded-lg shadow-lg text-center text-xl font-bold">
                  Predicted Engagement after 7 days:{" "}
                  {analysisResult.predictions.find((p: any) => p.days_since_post === 7).predicted_class}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">Follow LLM Instructions to improve your post!</p>
          )}

          <h2 className="text-xl font-bold mt-6 mb-4">LLM Response</h2>
          {llmResponse ? (
             <div
                className="bg-gray-700 p-4 rounded-lg space-y-2"
                dangerouslySetInnerHTML={{ __html: formatLlmResponse(llmResponse) }}
              />
          ) : (
            <p className="text-gray-400">No response yet.</p>
          )}
        </div>
      </div>

      {/* Spinner Styles */}
      <style jsx>{`
        .loader {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: auto;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
