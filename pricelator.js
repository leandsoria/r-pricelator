document.addEventListener('DOMContentLoaded', () => {
  const quiz = document.querySelector('.js-quiz');
  let amountOfEmployees;
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
    let valid = false;
    const next = slide.querySelector('.js-quiz-next');
    const prev = slide.querySelector('.js-quiz-prev');
    const answers = slide.querySelectorAll('.js-quiz-answer');

    const answerOrder = slide.querySelectorAll('.c-quiz__label--order');
    if (answerOrder) {
      answerOrder.forEach((aO, index) => {
        if (aO.length > 0){
          aO[index].textContent = String.fromCharCode(65 + index);
        }
      });
    }

    if (prev) {
      prev.addEventListener('click', (e) => {
        slide.classList.remove('active');
        if (index == 0) {
          firstSlide.classList.add('active');
        } else {
          slides[index - 1].classList.add('active');
        }
      });
    }

    if (next) {
      next.addEventListener('click', (e) => {
        slide.classList.remove('active');
        slides[index + 1].classList.add('active');
        console.log('next btn clicked');
      });
    }

    const inputEmployees = document.getElementById('input-employees');
    const formEmployees = document.getElementById('form-employees');

    // Store amount of employees
    inputEmployees.addEventListener('input', (e) => {
      amountOfEmployees = e.target.value;
    });

    // Next slide on input submit
    formEmployees.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
        slide.classList.remove('active');
        slides[1].classList.add('active');
      },
      false
    );

    if (answers.length > 0) {
      [...answers].forEach((answer, index) => {
        answer.addEventListener('click', (e) => {
          answer.classList.add('active');
          if (slides[index] == slide) {
            slide.classList.remove('active');
            slides[index + 1].classList.add('active');
          }

          const { property, value, link } = answer.dataset;
          const inputs = form.querySelectorAll(
            `input[name="${property}],select[name${property}]`
          );

          if (link) {
            redirectTo = link;
          }

          const input = [...inputs].filter(
            (el) =>
              (el.type == 'radio' &&
                el.name == property &&
                el.value == value) ||
              (el.type !== 'radio' && el.name == property)
          )[0];

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
            if (next) {
              next.click();
            }
          }
        });
      });
    }
  });
  window.addEventListener('message', (event) => {
    if (
      event.data.type === 'hsFormCallback' &&
      event.data.eventName === 'onFormSubmitted'
    ) {
      if (!redirectTo) return;
      window.location.href = redirectTo;
    }
  });
});
