document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('scannerVideo');
    const canvas = document.getElementById('scannerCanvas');
    const startBtn = document.getElementById('startScanner');
    const stopBtn = document.getElementById('stopScanner');
    const cameraSelect = document.getElementById('cameraSelect');
    const scanResult = document.getElementById('scanResult');
    const attendeeInfo = document.getElementById('attendeeInfo');
    const confirmCheckinBtn = document.getElementById('confirmCheckin');
    
    let stream = null;
    let scanningInterval = null;
    let currentScanResult = null;
    
    async function initCameraSelection() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            videoDevices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${cameraSelect.length}`;
                cameraSelect.appendChild(option);
            });
        } catch (err) {
            console.error('Error enumerating devices:', err);
            scanResult.innerHTML = '<p class="error">Could not access camera devices</p>';
        }
    }
    
    // Start scanning
    async function startScanner() {
        if (stream) {
            stopScanner();
        }
        
        const constraints = {
            video: {
                facingMode: 'environment',
                deviceId: cameraSelect.value ? { exact: cameraSelect.value } : undefined
            }
        };
        
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            video.play();
            
            startBtn.disabled = true;
            stopBtn.disabled = false;
            cameraSelect.disabled = true;
            
            // Start scanning for QR codes
            scanningInterval = setInterval(scanQRCode, 500);
        } catch (err) {
            console.error('Error accessing camera:', err);
            scanResult.innerHTML = '<p class="error">Could not access camera: ' + err.message + '</p>';
        }
    }
    
    // Stop scanning
    function stopScanner() {
        if (scanningInterval) {
            clearInterval(scanningInterval);
            scanningInterval = null;
        }
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            video.srcObject = null;
        }
        
        startBtn.disabled = false;
        stopBtn.disabled = true;
        cameraSelect.disabled = false;
    }
    
    // Scan for QR codes
    function scanQRCode() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            try {
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    handleQRDetection(code.data);
                }
            } catch (err) {
                console.error('QR scanning error:', err);
            }
        }
    }
    
    // Handle detected QR code
    async function handleQRDetection(qrData) {
        if (currentScanResult === qrData) return; // Prevent duplicate processing
        
        currentScanResult = qrData;
        stopScanner();
        
        try {
            const data = JSON.parse(qrData);
            
            // Verify with backend
            const response = await fetch('/api/events/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ qrData: data })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                scanResult.innerHTML = '<p class="success">QR Code verified successfully!</p>';
                attendeeInfo.style.display = 'block';
                document.getElementById('attendeeName').textContent = result.user.name;
                document.getElementById('eventTitle').textContent = result.event.title;
                document.getElementById('checkinStatus').textContent = 
                    result.checkedIn ? 'Already checked in' : 'Not checked in yet';
                
                confirmCheckinBtn.disabled = result.checkedIn;
            } else {
                scanResult.innerHTML = `<p class="error">${result.message || 'Verification failed'}</p>`;
                attendeeInfo.style.display = 'none';
            }
        } catch (err) {
            console.error('Error verifying QR:', err);
            scanResult.innerHTML = '<p class="error">Invalid QR code format</p>';
            attendeeInfo.style.display = 'none';
        }
    }
    
    // Confirm check-in
    async function confirmCheckin() {
        try {
            const response = await fetch('/api/events/confirm-checkin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ qrData: JSON.parse(currentScanResult) })
            });
            
            if (response.ok) {
                scanResult.innerHTML = '<p class="success">Check-in confirmed successfully!</p>';
                confirmCheckinBtn.disabled = true;
                document.getElementById('checkinStatus').textContent = 'Checked in';
                
                // Restart scanner after 2 seconds
                setTimeout(() => {
                    currentScanResult = null;
                    attendeeInfo.style.display = 'none';
                    startScanner();
                }, 2000);
            } else {
                const result = await response.json();
                scanResult.innerHTML = `<p class="error">${result.message || 'Check-in failed'}</p>`;
            }
        } catch (err) {
            console.error('Error confirming check-in:', err);
            scanResult.innerHTML = '<p class="error">Error confirming check-in</p>';
        }
    }
    
    // Event listeners
    startBtn.addEventListener('click', startScanner);
    stopBtn.addEventListener('click', stopScanner);
    confirmCheckinBtn.addEventListener('click', confirmCheckin);
    
    // Initialize
    initCameraSelection();
});