// Supabase Initialization
const SUPABASE_URL = 'https://rdgzwqeiwckttgraloqb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_koeZUI_gUSWs0mM-wuwoiQ_Tr3oIyn2';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Initialize mock data for ui generic banners if not exists
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
        enquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = e.target[0].value;
            const category = e.target[1].value;
            const message = e.target[2].value;
            const trackingId = 'ENQ-' + Math.floor(1000 + Math.random() * 9000);
            
            try {
                if(!supabase) throw new Error("Supabase is not initialized.");
                
                const { error } = await supabase.from('enquiries').insert([{
                    id: trackingId,
                    name: name,
                    category: category,
                    message: message,
                    status: 'Received',
                    created_at: new Date().toISOString()
                }]);
                
                if (error) throw error;
                
                showTrackingModal(trackingId);
                enquiryForm.reset();
            } catch (err) {
                alert('Error submitting enquiry: ' + err.message + '\nMake sure the "enquiries" table exists in your Supabase project.');
            }
        });
    }

    // Intercept Tracking Form
    const trackForm = document.getElementById('trackForm');
    if (trackForm) {
        trackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const trackId = e.target[0].value.trim().toUpperCase();
            const resultDiv = document.getElementById('trackResult');
            
            try {
                if(!supabase) throw new Error("Supabase is not initialized.");
                
                const { data, error } = await supabase.from('enquiries').select('*').eq('id', trackId).single();
                
                if (error) throw error;
                
                if (data) {
                    let color = '#fff';
                    if (data.status === 'In Progress') color = '#ffd700';
                    if (data.status === 'Resolved') color = '#2ecc71';
                    
                    resultDiv.innerHTML = `
                        <div style="background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px; margin-top: 1rem; border-left: 4px solid ${color};">
                            <strong style="color: #ffd700;">Status:</strong> <span style="color:${color}; font-weight:bold;">${data.status}</span><br>
                            <strong style="color: #ffd700;">Category:</strong> ${data.category}<br>
                            <strong style="color: #ffd700;">Admin Reply:</strong> ${data.reply || 'Pending review...'}
                        </div>
                    `;
                }
            } catch (err) {
                resultDiv.innerHTML = `<p style="color: #ff6b6b; margin-top: 1rem;">Tracking ID not found or error: ${err.message}</p>`;
            }
        });
    }

    // Supabase Auth Integration
    const loginBtn = document.getElementById('loginBtn');
    const regBtn = document.getElementById('regBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            if(!email || !password) return alert('Please enter both email and password.');
            
            try {
                if(!supabase) throw new Error("Supabase is not initialized.");
                
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) throw error;
                alert('Login successful! Redirecting...');
                window.location.href = 'index.html';
            } catch (err) {
                alert('Login Failed: ' + err.message);
            }
        });
    }

    if (regBtn) {
        regBtn.addEventListener('click', async () => {
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            if(!email || !password) return alert('Please enter both email and password.');
            
            try {
                if(!supabase) throw new Error("Supabase is not initialized.");
                
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password
                });
                
                if (error) throw error;
                alert('Registration successful! Check your email or try logging in.');
            } catch (err) {
                alert('Registration Failed: ' + err.message);
            }
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
