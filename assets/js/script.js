// Initialize mock data if not exists
if (!localStorage.getItem('mockEnquiries')) {
    localStorage.setItem('mockEnquiries', JSON.stringify([]));
}
if (!localStorage.getItem('mockResidents')) {
    localStorage.setItem('mockResidents', JSON.stringify([]));
}
if (!localStorage.getItem('offerOfTheDay')) {
    localStorage.setItem('offerOfTheDay', JSON.stringify({ active: false, title: '', desc: '' }));
}

// Global UI Logic
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Load Offer of the day on index.html
    const offerContainer = document.getElementById('offer-container');
    if (offerContainer) {
        const offer = JSON.parse(localStorage.getItem('offerOfTheDay'));
        if (offer && offer.active) {
            offerContainer.style.display = 'block';
            offerContainer.innerHTML = `
                <h2 style="margin:0; font-size: 2rem; color: #fff;">🎉 Offer of the Day!</h2>
                <h3 style="color: #ffd700; font-size: 1.5rem; margin: 0.5rem 0;">${offer.title}</h3>
                <p style="color: #eee; font-size: 1.1rem; margin:0;">${offer.desc}</p>
            `;
        }
    }

    // Apply Society Branding to Home Page
    const brand = JSON.parse(localStorage.getItem('societyBranding'));
    if (brand && brand.name) {
        const dynName = document.getElementById('dynamic-society-name');
        if (dynName) dynName.innerText = brand.name;
        
        const dynImg = document.getElementById('dynamic-society-img');
        if (dynImg && brand.image) {
            dynImg.src = brand.image;
            dynImg.style.display = 'block';
        }
    }

    // Intercept Contact Enquiry Form
    const enquiryForm = document.getElementById('enquiryForm');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = e.target[0].value;
            const category = e.target[1].value;
            const message = e.target[2].value;
            
            // Generate Tracking ID (e.g. ENQ-5912)
            const trackingId = 'ENQ-' + Math.floor(1000 + Math.random() * 9000);
            
            const enquiries = JSON.parse(localStorage.getItem('mockEnquiries'));
            enquiries.push({
                id: trackingId,
                name,
                category,
                message,
                status: 'Received',
                date: new Date().toLocaleDateString()
            });
            localStorage.setItem('mockEnquiries', JSON.stringify(enquiries));
            
            // Show Custom Modal instead of alert
            showTrackingModal(trackingId);
            enquiryForm.reset();
        });
    }

    // Intercept Tracking Form
    const trackForm = document.getElementById('trackForm');
    if (trackForm) {
        trackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const trackId = e.target[0].value.trim().toUpperCase();
            const resultDiv = document.getElementById('trackResult');
            
            const enquiries = JSON.parse(localStorage.getItem('mockEnquiries'));
            const found = enquiries.find(eq => eq.id === trackId);
            
            if (found) {
                let color = '#fff';
                if (found.status === 'In Progress') color = '#ffd700';
                if (found.status === 'Resolved') color = '#2ecc71';
                
                resultDiv.innerHTML = `
                    <div style="background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px; margin-top: 1rem; border-left: 4px solid ${color};">
                        <strong style="color: #ffd700;">Status:</strong> <span style="color:${color}; font-weight:bold;">${found.status}</span><br>
                        <strong style="color: #ffd700;">Category:</strong> ${found.category}<br>
                        <strong style="color: #ffd700;">Admin Reply:</strong> ${found.reply || 'Pending review...'}
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `<p style="color: #ff6b6b; margin-top: 1rem;">Tracking ID not found.</p>`;
            }
        });
    }

    // Intercept Resident Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const residents = JSON.parse(localStorage.getItem('mockResidents'));
            
            residents.push({
                name: e.target[0].value,
                flat: e.target[1].value,
                contact: e.target[2].value,
                email: e.target[3].value,
                status: 'Pending Approval'
            });
            
            localStorage.setItem('mockResidents', JSON.stringify(residents));
            alert('Registration details sent to Admin for approval!');
            window.location.href = 'index.html';
        });
    }
});

// Modal Logic
function showTrackingModal(trackingId) {
    let modal = document.getElementById('enquiryModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'enquiryModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: #2ecc71; margin-bottom: 1rem;"></i>
                <h2 style="color: #fff; margin-bottom: 0.5rem;">Enquiry Received!</h2>
                <p style="color: #aaa;">Your request has been securely logged.</p>
                <div class="tracking-badge">${trackingId}</div>
                <p style="color: #aaa; font-size: 0.9rem;">Please save this Tracking ID to check your request status.</p>
                <button class="action-btn" onclick="closeModal()">Got it</button>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.querySelector('.tracking-badge').innerText = trackingId;
    }
    
    // Force reflow
    void modal.offsetWidth; 
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('enquiryModal');
    if (modal) {
        modal.classList.remove('active');
    }
}
