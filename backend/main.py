# pip3 install flask opencv-python flask-cors
from flask import Flask, render_template, request, flash, jsonify, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import cv2
import os
import base64
from io import BytesIO
from PIL import Image
import numpy as np


UPLOAD_FOLDER = 'uploads'
STATIC_FOLDER = 'static'
ALLOWED_EXTENSIONS = {'png', 'webp', 'jpg', 'jpeg', 'gif', 'bmp'}

app = Flask(__name__)
app.secret_key = 'super secret key'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['STATIC_FOLDER'] = STATIC_FOLDER

# Enable CORS for React frontend
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:3000",
    "https://steganography-jade.vercel.app"
]}}, supports_credentials=True)

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

def hide_message(image_path, message):
    """Hide message in image using LSB steganography"""
    img = Image.open(image_path).convert('RGB')
    img_array = np.array(img)
    
    # Convert message to binary + add delimiter
    binary_msg = ''.join([format(ord(c), '08b') for c in message])
    binary_msg += '1111111111111110'  # 16-bit delimiter
    
    # Check if message fits
    required_pixels = len(binary_msg)
    available_pixels = img_array.shape[0] * img_array.shape[1] * 3
    if required_pixels > available_pixels:
        raise ValueError("Message too large for image!")
    
    # Modify LSBs
    index = 0
    for row in img_array:
        for pixel in row:
            for channel in range(3):  # R, G, B
                if index < len(binary_msg):
                    pixel[channel] = (pixel[channel] & 0xFE) | int(binary_msg[index])
                    index += 1
    
    return Image.fromarray(img_array)

def extract_message(image_path):
    """Extract hidden message from an LSB-encoded image"""
    img = Image.open(image_path).convert('RGB')
    img_array = np.array(img)
    
    binary_msg = []
    delimiter = '1111111111111110'
    
    # Read LSBs from each pixel channel
    for row in img_array:
        for pixel in row:
            for channel in range(3):  # R, G, B
                binary_msg.append(str(pixel[channel] & 1))
                
                # Check for delimiter
                if len(binary_msg) >= 16 and ''.join(binary_msg[-16:]) == delimiter:
                    # Convert binary to string
                    binary_str = ''.join(binary_msg[:-16])  # Exclude delimiter
                    message = ''
                    for i in range(0, len(binary_str), 8):
                        byte = binary_str[i:i+8]
                        message += chr(int(byte, 2))
                    return message
    return "No hidden message found"

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
    
@app.route('/api/hide', methods=['POST'])
def hide():
    if 'image' not in request.files or not request.form.get('message'):
        return jsonify({"error": "Missing file or message"}), 400
    
    image = request.files['image']
    message = request.form['message']
    
    print("Hidden message received:", message)
    # Construct binary message for debugging
    binary_msg = ''.join([format(ord(c), '08b') for c in message]) + '1111111111111110'
    print("Binary message being hidden:", binary_msg)

    # Save original image
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
    image.save(img_path)
    
    # Process image
    stego_img = hide_message(img_path, message)
    stego_path = os.path.join(app.config['UPLOAD_FOLDER'], f'stego_{image.filename}')
    stego_img.save(stego_path)
    
    return jsonify({
        "original": f"/uploads/{image.filename}",
        "stego": f"/uploads/stego_{image.filename}"
    })

@app.route('/api/extract', methods=['POST'])
def extract():
    if 'image' not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400
    
    image = request.files['image']
    if not allowed_file(image.filename):  # Reuse the same check from encoding
        return jsonify({"error": "File type not allowed"}), 400
    
    # Save temporarily (or process in memory)
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
    image.save(img_path)
    
    # Extract message
    message = extract_message(img_path)
    
    # Clean up
    os.remove(img_path)
    
    return jsonify({"message": message})        

@app.route('/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))