# ChipCounter

ChipCounter is a mobile-first web application that allows users to scan poker chips using a phone camera, count them using a YOLOv8 model, and track player stats in real-time.

You can test the model two ways. 

1. Using the vercel link (This is the final project): https://chip-counter-front-end.vercel.app/

2. Test locally in your computer. You will have to install the requierements and run the python script wih the images to thest the model.

Next are the instruction to test the model locally in your computer

## 💠 Environment Setup

1. **Install Node.js and npm**  
   Make sure you have Node.js installed. You can download it from [https://nodejs.org](https://nodejs.org)

2. **Install dependencies**  
   Navigate to the frontend directory and run:

   ```bash
   npm install
   ```

3. **Create a `.env.local` file**  
   At the root of the frontend project, create a file named `.env.local` and paste the following environment variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://imhkwqgnvckoczwdnlwc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGt3cWdudmNrb2N6d2RubHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNDQwMDQsImV4cCI6MjA1OTcyMDAwNH0.GPv_TEn_VWU_okDqWHd3KNcPmv5aQ4gdlWNxnlIZQjI
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_USE_MOCK_DATA=false
   NEXT_PUBLIC_MODAL_BACKEND_URL=https://fernandoazanza--yolo-chip-detector-run-inference-from-upload.modal.run
   ```

4. **Test the YOLO model locally**

   To test the YOLO model with sample images:

   - Install the Python requirements:

     ```bash
     cd backend
     python3 -m venv venv
     source venv/bin/activate
     pip install -r requirements.txt
     ```

   - Run the test script:

     ```bash
     python image_infer.py
     ```

     This script loads an image from `test_images/`, performs inference, and displays the image with bounding boxes and a summary of chip counts by color. To test another image, modify line 10 in `image_infer.py`:

     ```python
     image_path = "test_images/IMG_9054.jpg"
     ```

5. **Run the development server**  
   Start the app by running:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`  
   Use this demo video to guide you:  `https://www.youtube.com/watch?v=7EnG1UHXX0Q&t=1s`
   To use the app in localhost log in using "Try Demo Mode"
   If you are using it from vercel you can log in using your google account.

## 📆 Backend (Model API)

The chip-counting model is deployed on [Modal](https://modal.com). The app sends image data to the endpoint and receives the count results in JSON format. No local setup is required for the backend.

## 🌐 Live Demo

You can test the full app here:  
[https://chip-counter-front-end.vercel.app](https://chip-counter-front-end.vercel.app)

---