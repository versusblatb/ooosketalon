// Детектор устройства
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window;

// Гамбургер-меню
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenu = document.getElementById('closeMenu');
const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

// Открыть меню
function openMobileMenu() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('active');
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
}

// Закрыть меню
function closeMobileMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Обработчики
hamburger.addEventListener('click', openMobileMenu);
closeMenu.addEventListener('click', closeMobileMenu);
menuOverlay.addEventListener('click', closeMobileMenu);

// Закрыть при клике на ссылку
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        setTimeout(closeMobileMenu, 300); // Плавно закрываем
    });
});

// Закрыть при свайпе влево (улучшение UX)
let touchStartX = 0;
mobileMenu.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
});

mobileMenu.addEventListener('touchmove', e => {
    const touchEndX = e.touches[0].clientX;
    if (touchEndX - touchStartX > 100) {
        closeMobileMenu();
    }
});

// Управление анимациями в зависимости от устройства
if (isMobile || isTouchDevice) {
    document.body.classList.add('mobile-device');
    
    document.querySelectorAll('.floating-element').forEach(el => {
        el.style.display = 'none';
    });
    
    if (document.getElementById('particles')) {
        document.getElementById('particles').style.display = 'none';
    }
} else {
    document.body.classList.add('desktop-device');
    
    document.querySelectorAll('.contact-card, .requisite-item, .footer-contact-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Предзагрузка
window.addEventListener('load', function() {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hide');
    }, 1000);
});

// Создание частиц
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

createParticles();

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Изменение навбара при скролле
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Telegram Bot Integration
const TELEGRAM_BOT_TOKEN = '7584541624:AAGDqY0HM6p33fgF6-PMW0sKyWElFfDR9oE';
const TELEGRAM_CHAT_ID = '7030978512';

async function sendToTelegram(formData) {
    const message = `
🚨 *НОВАЯ ЗАЯВКА С САЙТА ЭТАЛОН* 🚨

👤 *Имя:* ${formData.name}
📞 *Телефон:* ${formData.phone}
📧 *Email:* ${formData.email || 'Не указан'}
📝 *Тема:* ${formData.subject || 'Не выбрана'}
💬 *Сообщение:* ${formData.message}

📅 *Дата:* ${new Date().toLocaleString('ru-RU')}
🏢 *Компания:* ООО "СК "ЭТАЛОН"
📍 *Город:* Ставрополь
📱 *Источник:* Сайт компании
            `;

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: "📞 Позвонить", callback_data: `call_${formData.phone}` },
                        { text: "📧 Написать", callback_data: `email_${formData.email || 'нет'}` }
                    ], [
                        { text: "✅ В работу", callback_data: `accept_${Date.now()}` },
                        { text: "📋 Сохранить", callback_data: `save_${Date.now()}` }
                    ]]
                }
            })
        });

        return response.ok;
    } catch (error) {
        console.error('❌ Ошибка отправки в Telegram:', error);
        return false;
    }
}

// Обработчик формы
document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    submitButton.disabled = true;
    
    const sent = await sendToTelegram(formData);
    
    if (sent) {
        submitButton.innerHTML = '<i class="fas fa-check"></i> Отправлено!';
        submitButton.style.background = '#4CAF50';
        
        setTimeout(() => {
            this.reset();
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            submitButton.style.background = '';
        }, 3000);
    } else {
        submitButton.innerHTML = '<i class="fas fa-times"></i> Ошибка!';
        submitButton.style.background = '#f44336';
        
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            submitButton.style.background = '';
        }, 3000);
    }
});

// Маска для телефона
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 1) {
        if (value[0] === '7' || value[0] === '8') {
            value = value.slice(1);
        }
        if (value.length > 10) value = value.slice(0, 10);
        
        let formatted = '+7 ';
        if (value.length >= 3) {
            formatted += '(' + value.slice(0, 3) + ') ';
            if (value.length >= 6) {
                formatted += value.slice(3, 6) + '-';
                if (value.length >= 8) {
                    formatted += value.slice(6, 8) + '-' + value.slice(8);
                } else {
                    formatted += value.slice(6);
                }
            } else {
                formatted += value.slice(3);
            }
        } else {
            formatted += value;
        }
        
        e.target.value = formatted;
    }
});

// Анимации при скролле
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in').forEach(el => {
    observer.observe(el);
});

// Параллакс
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

console.log('✅ Сайт ООО "СК "ЭТАЛОН" загружен!');
console.log('🎯 Главный экран с WOW-эффектом активирован!');
console.log('📱 Telegram-интеграция настроена!');
console.log('✨ Проблема белого текста на белом фоне решена!');
console.log('📍 Геолокация: Ставрополь, ул. 8 марта, 164А, офис 74');