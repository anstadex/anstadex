
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ImageUploader } from './components/ImageUploader';
import { SelectInput } from './components/SelectInput';
import { Checkbox } from './components/Checkbox';
import { Loader } from './components/Loader';
import { Lightbox } from './components/Lightbox';
import { ASPECT_RATIOS, LIGHTING_STYLES, CAMERA_ANGLES, IMAGE_QUALITIES, POSE_MOVEMENTS, LOCATIONS } from './constants';
import { fileToGenerativePart } from './services/geminiService';
import type { ImageFile } from './types';

const App: React.FC = () => {
  const [userImage, setUserImage] = useState<ImageFile | null>(null);
  const [objectImage, setObjectImage] = useState<ImageFile | null>(null);
  const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);

  const [aspectRatio, setAspectRatio] = useState<string>(ASPECT_RATIOS[0].value);
  const [lightingStyle, setLightingStyle] = useState<string>(LIGHTING_STYLES[0].value);
  const [cameraAngle, setCameraAngle] = useState<string>(CAMERA_ANGLES[0].value);
  const [poseMovement, setPoseMovement] = useState<string>(POSE_MOVEMENTS[0].value);
  const [customPoseMovement, setCustomPoseMovement] = useState<string>('');
  const [location, setLocation] = useState<string>(LOCATIONS[0].value);
  const [customLocation, setCustomLocation] = useState<string>('');
  const [imageQuality, setImageQuality] = useState<string>(IMAGE_QUALITIES[0].value);
  const [useHdr, setUseHdr] = useState<boolean>(false);

  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  useEffect(() => {
    const qualityLabel = IMAGE_QUALITIES.find(q => q.value === imageQuality)?.label || imageQuality;
    let newPrompt = `Using the photo of the person and the photo of the object, create a new photorealistic image where the person is holding or using the object naturally.`;

    if (referenceImage) {
      newPrompt += ` Emulate the style, composition, and pose from the reference photo.`;
    }

    if (poseMovement === 'custom' && customPoseMovement.trim() !== '') {
      newPrompt += ` The person's pose/movement should be: ${customPoseMovement.trim()}.`;
    } else if (poseMovement !== 'none' && poseMovement !== 'custom') {
      newPrompt += ` The person should have a ${poseMovement}.`;
    }
    
    if (location === 'custom' && customLocation.trim() !== '') {
      newPrompt += ` The setting should be: ${customLocation.trim()}.`;
    } else if (location === 'indoor' || location === 'outdoor') {
      newPrompt += ` The setting should be ${location}.`;
    }

    newPrompt += ` The final image should have a ${cameraAngle}, ${lightingStyle}, and a ${aspectRatio} aspect ratio. Render in ${qualityLabel}${useHdr ? ' with HDR 10+ for a cinematic look' : ''}.`;
    
    setPrompt(newPrompt);
  }, [aspectRatio, lightingStyle, cameraAngle, imageQuality, useHdr, referenceImage, poseMovement, customPoseMovement, location, customLocation]);

  const handleGenerateClick = useCallback(async () => {
    if (!userImage || !objectImage) {
      setError('Please upload both a user photo and an object photo.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedText(null);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const userImagePart = await fileToGenerativePart(userImage.file, aspectRatio);
      const objectImagePart = await fileToGenerativePart(objectImage.file, aspectRatio);

      const parts: unknown[] = [
        userImagePart,
        objectImagePart,
      ];

      if (referenceImage) {
        const referenceImagePart = await fileToGenerativePart(referenceImage.file, aspectRatio);
        parts.push(referenceImagePart);
      }
      
      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          setGeneratedImage(`data:${mimeType};base64,${base64ImageBytes}`);
          foundImage = true;
        } else if (part.text) {
          setGeneratedText(part.text);
        }
      }
      if (!foundImage) {
          setError("The AI did not return an image. Please try adjusting your prompt or images.");
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userImage, objectImage, referenceImage, prompt, aspectRatio]);
  
  const handleDownload = useCallback(() => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;

    const mimeTypeMatch = generatedImage.match(/^data:(image\/[a-z]+);/);
    const extension = mimeTypeMatch ? mimeTypeMatch[1].split('/')[1] : 'png';

    link.download = `ai-photo-studio-generated.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage]);

  const handleOpenLightbox = () => {
    if (generatedImage) {
      setIsLightboxOpen(true);
    }
  };

  const isButtonDisabled = !userImage || !objectImage || isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">AI Photo Studio</h1>
          <p className="mt-2 text-lg text-gray-400">Create stunning composite images with the power of Nano Banana AI</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Inputs & Controls */}
          <div className="flex flex-col gap-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-2xl font-semibold text-white border-b border-gray-600 pb-3">1. Upload Your Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImageUploader id="user-image" label="Your Photo" onImageUpload={setUserImage} />
              <ImageUploader id="object-image" label="Object Photo" onImageUpload={setObjectImage} />
              <ImageUploader id="reference-image" label="Style Reference (Optional)" onImageUpload={setReferenceImage} />
            </div>
            
            <h2 className="text-2xl font-semibold text-white border-b border-gray-600 pb-3 mt-4">2. Set Creative Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput label="Aspect Ratio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} options={ASPECT_RATIOS} />
              <SelectInput label="Lighting Style" value={lightingStyle} onChange={e => setLightingStyle(e.target.value)} options={LIGHTING_STYLES} />
              <SelectInput label="Camera Angle" value={cameraAngle} onChange={e => setCameraAngle(e.target.value)} options={CAMERA_ANGLES} />
              <SelectInput label="Pose/Movement" value={poseMovement} onChange={e => setPoseMovement(e.target.value)} options={POSE_MOVEMENTS} />
              <SelectInput label="Output Quality" value={imageQuality} onChange={e => setImageQuality(e.target.value)} options={IMAGE_QUALITIES} />
              <SelectInput label="Location" value={location} onChange={e => setLocation(e.target.value)} options={LOCATIONS} />
              {poseMovement === 'custom' && (
                <div className="md:col-span-2">
                  <label htmlFor="custom-pose-input" className="block text-sm font-medium text-gray-300 mb-1">Describe Custom Pose</label>
                  <input
                    id="custom-pose-input"
                    type="text"
                    value={customPoseMovement}
                    onChange={(e) => setCustomPoseMovement(e.target.value)}
                    placeholder="e.g., 'jumping for joy'"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  />
                </div>
              )}
               {location === 'custom' && (
                <div className="md:col-span-2">
                  <label htmlFor="custom-location-input" className="block text-sm font-medium text-gray-300 mb-1">Describe Custom Location</label>
                  <input
                    id="custom-location-input"
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="e.g., 'a futuristic city street'"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  />
                </div>
              )}
            </div>
            <Checkbox label="Enable HDR 10+ Quality" checked={useHdr} onChange={e => setUseHdr(e.target.checked)} />

            <h2 className="text-2xl font-semibold text-white border-b border-gray-600 pb-3 mt-4">3. Refine Your Prompt</h2>
            <textarea
              className="w-full h-36 bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Your auto-generated prompt will appear here..."
            />
          </div>

          {/* Right Column: Action & Output */}
          <div className="flex flex-col gap-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
             <h2 className="text-2xl font-semibold text-white border-b border-gray-600 pb-3">4. Generate Your Image</h2>
            <button
              onClick={handleGenerateClick}
              disabled={isButtonDisabled}
              className={`w-full py-3 px-6 text-lg font-semibold rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center
                ${isButtonDisabled 
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transform hover:scale-105'
                }`}
            >
              {isLoading ? <><Loader /> Generating...</> : 'Create Image'}
            </button>
            
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg">{error}</div>}
            
            <div className="flex-grow flex items-center justify-center bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-600 min-h-[400px] p-4">
              {isLoading ? (
                <div className="text-center">
                  <Loader size="lg" />
                  <p className="mt-4 text-gray-400">AI is crafting your image... this may take a moment.</p>
                </div>
              ) : generatedImage ? (
                <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
                  <img 
                    src={generatedImage} 
                    alt="Generated by AI" 
                    className="max-w-full max-h-[calc(100%-60px)] object-contain rounded-md cursor-pointer transition-transform duration-200 hover:scale-105"
                    onClick={handleOpenLightbox}
                  />
                  <button
                    onClick={handleDownload}
                    className="py-2 px-5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-lg transform hover:scale-105"
                    aria-label="Download generated image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Image
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="mt-2">Your masterpiece will appear here</p>
                </div>
              )}
            </div>
             {generatedText && <p className="text-sm text-gray-400 p-3 bg-gray-900/50 rounded-lg"><strong>AI Note:</strong> {generatedText}</p>}
          </div>
        </main>
      </div>
      <Lightbox 
        isOpen={isLightboxOpen} 
        imageUrl={generatedImage} 
        onClose={() => setIsLightboxOpen(false)} 
      />
    </div>
  );
};

export default App;
