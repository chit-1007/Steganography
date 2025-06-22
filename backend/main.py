# pip3 install flask opencv-python flask-cors
from flask import Flask, render_template, request, flash, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import cv2
import os
import base64
from io import BytesIO
from PIL import Image

UPLOAD_FOLDER = 'uploads'
STATIC_FOLDER = 'static'
ALLOWED_EXTENSIONS = {'png', 'webp', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
app.secret_key = 'super secret key'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['STATIC_FOLDER'] = STATIC_FOLDER

# Enable CORS for React frontend
CORS(app, origins=["http://localhost:3000"])

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(STATIC_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def processImage(filename, operation):
    print(f"the operation is {operation} and filename is {filename}")
    img = cv2.imread(f"uploads/{filename}")
    
    if img is None:
        raise Exception("Could not load image")
    
    match operation:
        case "cgray":
            imgProcessed = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            newFilename = f"static/{filename.split('.')[0]}_gray.png"
            cv2.imwrite(newFilename, imgProcessed)
            return newFilename
        case "cwebp": 
            newFilename = f"static/{filename.split('.')[0]}.webp"
            cv2.imwrite(newFilename, img)
            return newFilename
        case "cjpg": 
            newFilename = f"static/{filename.split('.')[0]}.jpg"
            cv2.imwrite(newFilename, img)
            return newFilename
        case "cpng": 
            newFilename = f"static/{filename.split('.')[0]}.png"
            cv2.imwrite(newFilename, img)
            return newFilename
    return None

# Your original routes
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/edit", methods=["GET", "POST"])
def edit():
    if request.method == "POST": 
        operation = request.form.get("operation")
        if 'file' not in request.files:
            flash('No file part')
            return "error"
        file = request.files['file']
        if file.filename == '':
            flash('No selected file')
            return "error no selected file"
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            new = processImage(filename, operation)
            flash(f"Your image has been processed and is available <a href='/{new}' target='_blank'>here</a>")
            return render_template("index.html")
    return render_template("index.html")

@app.route("/api/convert", methods=["POST"])
def api_convert():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        operation = request.form.get('operation', 'cpng')
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process image
        processed_path = processImage(filename, operation)
        
        if not processed_path or not os.path.exists(processed_path):
            return jsonify({'error': 'Image processing failed'}), 500
        
        # Convert processed image to base64
        with open(processed_path, 'rb') as img_file:
            img_base64 = base64.b64encode(img_file.read()).decode('utf-8')
        
        # Get file extension for MIME type
        file_ext = processed_path.split('.')[-1].lower()
        mime_type = f"image/{file_ext}"
        
        # Clean up uploaded file
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'image_data': f"data:{mime_type};base64,{img_base64}",
            'filename': os.path.basename(processed_path),
            'operation': operation
        })
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@app.route("/api/download/<filename>")
def api_download(filename):
    try:
        file_path = os.path.join(app.config['STATIC_FOLDER'], filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)