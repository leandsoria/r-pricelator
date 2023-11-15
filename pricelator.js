document.addEventListener('DOMContentLoaded', () => {
  const quiz = document.querySelector('.js-quiz');
  let amountOfEmployees;
  const infoCollected = {};
  if (!quiz) return;

  const firstSlide = quiz.querySelector('.js-quiz-first-slide');
  const slides = quiz.querySelectorAll('.js-quiz-slide');
  const form = quiz.querySelector('.js-quiz-form');

  let redirectTo = false;

  if (!slides.length || !firstSlide || !form) return;

  const start = firstSlide.querySelector('.js-quiz-next');

  start.addEventListener('click', (e) => {
    firstSlide.classList.remove('active');
    slides[0].classList.add('active');
  });

  [...slides].forEach((slide, index) => {
    const answers = slide.querySelectorAll('.js-quiz-answer');

    const inputEmployees = document.getElementById('input-employees');
    const inputErrorValidation = document.querySelector('.c-quiz__input--error');
    const formEmployees = document.getElementById('form-employees');

    // Store amount of employees
    inputEmployees.addEventListener('input', (e) => {
      employeesValue = e.target.value;
      amountOfEmployees = employeesValue;
      if (employeesValue || employeesValue > 0 || employeesValue == '') {
        inputEmployees.dataset.value = employeesValue;
        inputEmployees.style.borderColor = '#cf005b';
        inputErrorValidation.classList.remove('is-shown');
      } else {
        inputEmployees.removeAttribute('style');
      }
    });

    // Next slide on input submit
    formEmployees.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
        if (!amountOfEmployees || amountOfEmployees == 0) {
          inputErrorValidation.classList.add('is-shown');
          inputEmployees.style.borderColor = '#da0000';
        }
        if (amountOfEmployees > 0) {
          slide.classList.remove('active');
          slides[1].classList.add('active');
          storeDataOnHSForm(inputEmployees);
        }
      },
      false
    );

    /* Set progress bar */
    const progressBarCircle = slide.querySelectorAll('.c-quiz__progress--circle');

    progressBarCircle.forEach((circle, circleIndex) => {
      if (index >= circleIndex) {
        circle.classList.add('c-quiz__progress--circle-active');
      } else {
        circle.classList.remove('c-quiz__progress--circle-active');
      }
    });

    // Next slide & Store HS form info on answer click
    if (answers.length > 0) {
      [...answers].forEach((answer, answerIndex) => {
        // Go to next slide when choice is clicked
        answer.addEventListener('click', (e) => {
          // Update HS form inputs
          storeDataOnHSForm(answer, answers);

          if (index == 1 && infoCollected.environment == 'Fully remote') {
            slide.classList.remove('active');
            slides[index + 2].classList.add('active');
          } else if (slides[index] == slide) {
            slide.classList.remove('active');
            slides[index + 1].classList.add('active');
          }
          answer.classList.add('active');
          if (index == slides.length - 2) {
            calculateTotalPrice();
            updateEstimatedValue();
            updateCopy();
            submitHSForm()

          }
        });
      });
    }

    /*  Add list order to Answers */
    const answerOrder = slide.querySelectorAll('.c-quiz__label--order');
    answerOrder.forEach((aO, index) => {
      if (aO) {
        let currentChar = 65 + index;
        aO.textContent = `${String.fromCharCode(65)}. `;
        aO.textContent = `${String.fromCharCode(currentChar)}. `;
      }
    });
  });

  window.addEventListener('message', (event) => {
    if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
      if (!redirectTo) return;
      window.location.href = redirectTo;
    }
  });

  function storeDataOnHSForm(answer, answers) {
    const { property, value } = answer.dataset;
    infoCollected[property] = value;

    // retrieve all inputs with matching property name from hubspot form
    const inputs = form.querySelectorAll(`input[name="${property}"], select[name="${property}"]`);

    const input = [...inputs].filter((el) => (el.type == 'radio' && el.name == property && el.value == value) || (el.type !== 'radio' && el.name == property))[0];

    // Store information on hubspot form
    if (input) {
      if (input.type === 'radio') {
        input.click();
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        input.value = answer.dataset.value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    if (answer.dataset.type === 'radio') {
      [...answers].forEach((el) => {
        if (el !== answer) {
          el.classList.remove('active');
        }
      });
    }
  }

  function submitHSForm() {
    const submitBtnForm = document.querySelector('input.hs-button[type="submit"]')
    submitBtnForm.click()
    console.log(infoCollected)
    console.log('Form Submitted')
  }

  function calculateTotalPrice() {
    const { environment, amount_offices, input_employees } = infoCollected;
    if (environment == 'Fully remote') {
      infoCollected.price = 170;
    } else {
      switch (amount_offices) {
        case '1':
          infoCollected.price = 180;
          break;
        case '2':
          infoCollected.price = 195;
          break;
        case '3':
          infoCollected.price = 215;
          break;
        case '4+':
          infoCollected.price = 225;
          break;
      }
    }
    if (infoCollected.price) {
      infoCollected.totalPrice = (Number(infoCollected.price) * Number(input_employees)).toLocaleString('en-US');
    }
  }
  function updateEstimatedValue() {
    const estimatedValue = document.querySelector('.c-quiz-price--value');
    estimatedValue.textContent = infoCollected.totalPrice;
  }
  function updateCopy() {
    const { environment, amount_offices, input_employees } = infoCollected;
    const { remoteSmallTeam, remoteLargeTeam, officeSmallTeam, officeLargeTeam, multiofficeLargeteam, hybridOneOffice, hybridMultioffice } = lastSlideContent;
    const priceSlideCopy = document.querySelector('.c-quiz__price-copy');
    const priceSlideDisclaimer = document.querySelector('.c-quiz__price--disclaimer');
    const lastImage = document.querySelector('.c-quiz__last-slide--img');
    // remote small team
    if (environment == 'Fully remote' && Number(input_employees) <= 55) {
      getCopy(remoteSmallTeam);
    }
    // remote large team
    if (environment == 'Fully remote' && Number(input_employees) >= 56) {
      getCopy(remoteLargeTeam);
    }
    // office small team - office 1
    if (environment == 'In-office' && Number(input_employees) <= 55 && amount_offices == '1') {
      getCopy(officeSmallTeam);
    }
    // office large team - office 1
    if (environment == 'In-office' && Number(input_employees) >= 56 && amount_offices == '1') {
      getCopy(officeLargeTeam);
    }
    // Multioffice large team - office 1
    if (environment == 'In-office' && Number(input_employees) >= 56 && amount_offices != '1') {
      getCopy(multiofficeLargeteam);
    }

    // Hybrid one office - office 1
    if (environment == 'Hybrid' && amount_offices == '1') {
      getCopy(hybridOneOffice);
    }
    // Hybrid multioffice large - office 1
    if (environment == 'Hybrid' && amount_offices != '1') {
      getCopy(hybridMultioffice);
    }

    function getCopy(content) {
      priceSlideCopy.innerHTML = content.copy;
      priceSlideDisclaimer.textContent = content.disclaimer;
      lastImage.src = content.imageUrl;
      lastImage.alt = content.imageAlt;
    }
  }
});

const lastSlideContent = {
  remoteSmallTeam: {
    copy: `<p>Looks like you have a tight-knit team that’s fully remote. Lucky for you, we’re the experts in providing IT support to teams—no matter where they work.</p><p>With over 17 years of experience, Ripple supports almost any work environment, large or small, with scaleable IT strategies and 24/7 user assistance.</p><p>Let's refine this estimate and align it with your team's unique setup. Our team is ready to dive into the specifics with you.</p>`,
    disclaimer: `Disclaimer:  This estimate is based on your answers and our past experiences working with companies with similar specifications; your personalized quote may change based on your unique needs.`,
    imageUrl: `/hubfs/small-team.webp`,
    imageAlt: `Small team picture`,
  },
  remoteLargeTeam: {
    copy: `<p>Your remote team is crushing it! But we know covering IT for a large crew spread out everywhere can be tedious at best.</p>
    <p>That's where Ripple shines.</p>    
    <p>We support teams of all sizes no matter where they are with end-to-end security, round-the-clock support, and robust IT solutions that scale with you.</p>
    <p>Time to tailor this estimate to your team's unique needs. Our team is on standby to ensure your IT strategy is a perfect fit.</p>
    `,
    disclaimer: `Disclaimer:  This estimate is based on your answers and our past experiences working with companies with similar specifications; your personalized quote may change based on your unique needs.`,
    imageUrl: `/hubfs/large-team.webp`,
    imageAlt: `Large team picture`,
  },
  officeSmallTeam: {
    copy: `<p>In your office, every member of the team plays a big role. That’s why it’s important to stay connected at all times.</p>
    <p>At Ripple, we’re in the business of people support, not IT support.</p>
    <p>We make sure your in-office squad stays together with scaleable IT strategies, hands-on use onboarding, and 24/7 support that feels like it's just down the hall.</p>
    <p>Let's make sure our estimate matches your office's unique needs. Our team is ready to craft an IT solution that feels like part of the family.</p>
    `,
    disclaimer: `Disclaimer: This estimate is based on your answers and our past experiences working with companies with similar specifications; your personalized quote may change based on your unique needs.`,
    imageUrl: `/hubfs/small-team.webp`,
    imageAlt: `Small team picture`,
  },
  officeLargeTeam: {
    copy: `<p>Your bustling office is a hub for managing your large team's activity. Effective IT support is crucial to keeping the buzz going.</p>
    <p>Ripple has supported offices like yours with proactive IT strategies that keep operations secure and supported, no matter the scale, for over 17 years.</p>
    <p>Let’s perfect this estimate together. Reach out to the team to nail down an IT plan that’s tailored to your dynamic office life.</p>`,
    disclaimer: `Disclaimer:  This estimate is based on your answers and our past experiences working with companies with similar specifications; your personalized quote may change based on your unique needs.`,
    imageUrl: `/hubfs/large-team.webp`,
    imageAlt: `Large team picture`,
  },
  multiofficeLargeteam: {
    copy: `<p>Powerhouse teams with multiple offices like yours have big IT needs. You need a flexible and scalable IT partner to support your growth.</p>
    <p>That’s where Ripple comes in.</p>
    <p>We deliver cohesive IT strategies that unite your offices under one digital roof, so no office, team, or team member ever goes unsupported.</p>
    <p>Tailor this estimate to fit your business’s exact IT needs. Connect with our team for an IT support plan that scales with your goals.</p>`,
    disclaimer: `Disclaimer:  This estimate is based on your answers and our past experiences working with companies with similar specifications; your personalized quote may change based on your unique needs.`,
    imageUrl: `/hubfs/multi-office__large-team.webp`,
    imageAlt: `Multi-office Large team`,
  },
  hybridOneOffice: {
    copy: `<p>Ripple knows hybrid work works. We’ve been supporting them for over 17 years. And we know hybrid teams thrive on flexibility.</p>
    <p>With one foot in the office and one wherever else you work, your IT setup has to be just as flexible as your team. That’s why we provide IT support that bridges the gap between desk and distance seamlessly.</p>
    <p>Let's fine-tune this estimate to fit your hybrid office’s needs. Melissa's eager to map out an IT strategy that syncs perfectly with your office's routine.</p>
    `,
    disclaimer: `Disclaimer: This estimate is based on your answers and our past experiences working with companies with similar specifications; your personalized quote may change based on your unique needs.`,
    imageUrl: `/hubfs/hybrid-one-office.webp`,
    imageAlt: `Hybrid office`,
  },
  hybridMultioffice: {
    copy: `<p>Navigating a hybrid team across various offices is no small feat. But you’re making it happen while still growing. Let us help.</p>
    <p>You know what your employees want, and Ripple can help you satisfy their complicated IT needs with round-the-clock user support and scaleable IT strategies.</p>
    <p>Ready for a custom-fit IT strategy? Connect with Melissa to get a precise quote on your IT setup.</p>`,
    disclaimer: `Disclaimer: This estimate is based on your answers and our past experiences working with companies with similar specifications; your personalized quote may change based on your unique needs.`,
    imageUrl: `/hubfs/hybrid-multi-office.webp`,
    imageAlt: `Hybrid Multi-office`,
  },
};
