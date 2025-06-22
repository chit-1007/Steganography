from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React
app.config['UPLOAD_FOLDER'] = 'static/uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'bmp'}
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
    app.run(debug=True, port=5000)