function setAnswer(target) {
  const parentElement = target.parentElement;
  const nextBtn = parentElement.querySelector('.next');
  const previousValue = nextBtn.getAttribute('data-value');
  const answer = nextBtn.getAttribute('data-answer');
  const targetValue = target.value ? target.value : target.innerText;
  console.log(targetValue);
  console.log(answer);
  if (answer === 'multiple') {
    if (previousValue) {
      nextBtn.setAttribute('data-value', `${previousValue}, ${targetValue}`);
    } else {
      nextBtn.setAttribute('data-value', targetValue);
    }
  } else {
    nextBtn.setAttribute('data-value', targetValue);
  }
}

class TypeQuestion {
  constructor(item) {
    this.text = item.text;
  }
  render() {
    const element = document.createElement('div');
    element.className = 'question';
    element.innerText = this.text;
    return element;
  }
}

class CategorySelect {
  constructor(item) {
    this.text = item.text;
  }
  render() {
    const element = document.createElement('div');
    element.classList.add('answer');
    element.classList.add('select');
    element.innerHTML = this.text;

    element.addEventListener('click', e => {
      const element = e.target;
      const parentElement = element.parentElement;
      console.log(parentElement);
      parentElement.querySelectorAll('.select').forEach(item => {
        item.classList.remove('selected');
      });
      element.classList.add('selected');
      setAnswer(element);
    });
    return element;
  }
}

class CategoryInput {
  render() {
    const element = document.createElement('input');
    element.classList.add('answer');
    // element.classList.add('input');
    element.addEventListener('change', e => {
      console.log(e.target);
      setAnswer(e.target);
    });
    return element;
  }
}

class CategoryToggle {
  constructor(item) {
    this.props = { ...item };
  }

  checkbox() {
    const element = document.createElement('input');
    element.type = 'checkbox';

    element.addEventListener('change', e => {
      if (e.target.checked && this.props.afterToggle) {
        for (const item of Object.keys(this.props.afterToggle)) {
          if (item === 'render') {
            const entries = this.props.afterToggle[item].entries;
            const element = e.target.parentElement;
            this.afterToggle()[item](element, entries);
          }
        }
      } else if (!e.target.checked && this.props.afterToggle) {
        for (const item of Object.keys(this.props.afterToggle)) {
          if (item === 'render') {
            const element = e.target.parentElement;
            const parentElement = element.parentElement;
            parentElement
              .querySelectorAll('.adjacent')
              .forEach(item => item.remove());
          }
        }
      }
    });
    return element;
  }

  label() {
    const element = document.createElement('span');
    element.innerText = this.props.text;
    return element;
  }

  afterToggle() {
    return {
      render: (element, entries) => {
        for (const item of entries) {
          let el = componentSelector(item);
          let adjacent = el.render();
          adjacent.classList.add('adjacent');
          element.insertAdjacentElement(item.insert, adjacent);
        }
      },
    };
  }

  render() {
    const element = document.createElement('label');
    element.append(this.checkbox());
    element.append(this.label());
    return element;
  }
}

class CategoryDate {
  render() {
    const element = document.createElement('input');
    element.classList.add('answer');
    element.classList.add('input');
    flatpickr(element, {});
    return element;
  }
}

class CategoryTable {
  generateTableRow(element) {
    let row = 1;
    for (let i = 1; i < 4; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = `row-${row} col-${i}`;
      if (i === 3) flatpickr(input, {});
      element.append(input);
    }
  }

  tableHead(element, text) {
    for (const item of text) {
      const th = document.createElement('div');
      th.innerText = item;
      element.append(th);
    }
  }

  render() {
    const element = document.createElement('div');
    const th = [
      'Application/Registration No.',
      'Name',
      'Application/Registration Date',
    ];
    element.classList.add('table');
    this.tableHead(element, th);
    this.generateTableRow(element);
    return element;
  }
}

class QuestionBox {
  constructor({ entries = [], answer = 'single' }) {
    this.entries = entries;
    this.answer = answer;
  }

  prev() {
    const element = document.createElement('span');
    element.className = 'prev';
    element.innerText = 'PREV';
    return element;
  }

  next() {
    const element = document.createElement('span');
    element.className = 'next';
    element.innerText = 'NEXT';
    element.setAttribute('data-value', '');
    element.setAttribute('data-answer', this.answer);
    element.addEventListener('click', e => {
      console.log(e.target.getAttribute('data-value'));
    });
    return element;
  }

  buttons() {
    const element = document.createElement('div');
    element.className = 'box-buttons';
    element.append(this.prev());
    element.append(this.next());
    return element;
  }

  render() {
    const holder = document.querySelector('#questions-holder');
    const element = document.createElement('div');
    element.className = 'question-box';

    for (const item of this.entries) {
      let el = componentSelector(item);
      element.append(el.render());
    }

    element.append(this.buttons());
    holder.append(element);
  }
}

function componentSelector(item) {
  let element;
  if (item.type === 'question') {
    element = new TypeQuestion(item);
  } else if (item.type === 'answer') {
    if (item.category === 'select') {
      element = new CategorySelect(item);
    } else if (item.category === 'input') {
      element = new CategoryInput();
    } else if (item.category === 'toggle') {
      element = new CategoryToggle(item);
    } else if (item.category === 'date') {
      element = new CategoryDate(item);
    } else if (item.category === 'table') {
      element = new CategoryTable();
    }
  }
  return element;
}

const q = new QuestionBox({
  entries: [
    {
      type: 'question',
      text: `Are you assigning (a) a trademark application, OR: (b) registered trademark?`,
    },
    { type: 'answer', category: 'select', text: `trademark application` },
    { type: 'answer', category: 'select', text: `registered trademark` },
  ],
  answer: 'single',
});

const q2 = new QuestionBox({
  entries: [
    { type: 'question', text: `Serial Number` },
    { type: 'answer', category: 'input' },
    { type: 'question', text: `Application Date` },
    { type: 'answer', category: 'date' },
    {
      type: 'answer',
      category: 'toggle',
      text: `I want to assign more than one trademark within this agreement`,
      afterToggle: {
        render: {
          entries: [
            {
              type: 'answer',
              category: 'input',
              // position - adjacent to the element'
              // 'beforebegin': Before the targetElement itself.
              // 'afterbegin': Just inside the targetElement, before its first child.
              // 'beforeend': Just inside the targetElement, after its last child.
              // 'afterend': After the targetElement itself.
              insert: 'afterend',
            },
            {
              type: 'question',
              text: 'Number of trademarks',
              insert: 'afterend',
            },
          ],
        },
      },
    },
  ],
  answer: 'multiple',
});

const q3 = new QuestionBox({
  entries: [
    { type: 'question', text: `Registration Number` },
    { type: 'answer', category: 'input' },
    { type: 'question', text: `Registration Date` },
    { type: 'answer', category: 'date' },
    {
      type: 'answer',
      category: 'toggle',
      text: `I want to assign more than one trademark within this agreement`,
      afterToggle: {
        render: {
          entries: [
            {
              type: 'answer',
              category: 'input',
              // position - adjacent to the element'
              // 'beforebegin': Before the targetElement itself.
              // 'afterbegin': Just inside the targetElement, before its first child.
              // 'beforeend': Just inside the targetElement, after its last child.
              // 'afterend': After the targetElement itself.
              insert: 'afterend',
            },
            {
              type: 'question',
              text: 'Number of trademarks',
              insert: 'afterend',
            },
          ],
        },
      },
    },
  ],
  answer: 'multiple',
});

const q4 = new QuestionBox({
  entries: [
    { type: 'question', text: 'List of Trademarks' },
    {
      type: 'answer',
      category: 'table',
    },
  ],
  answer: 'multiple',
});

const q5 = new QuestionBox({
  entries: [
    {
      type: 'question',
      text: `What is the RELATIONSHIP between assignor and assignee:`,
    },
    {
      type: 'answer',
      category: 'select',
      text: `<b>“internal assignment”</b> – both assignor and assignee are under the same or similar control, and no extensive representations and warranties have to be provided for`,
    },
    {
      type: 'answer',
      category: 'select',
      text: `<b>“between friendly parties”</b> – this format is recommended if there is an established trust between assignor and assignee, and there is no need to spell out extensive obligations`,
    },
    {
      type: 'answer',
      category: 'select',
      text: `<b>“unknown party”</b> – check here if you are not sure how trustworthy your counterparty is, so all obligations are spelled out in the contract`,
    },
  ],
  answer: 'single',
});

const q6 = new QuestionBox({
  entries: [
    {
      type: 'question',
      text: `Is there a significant purchase price to be paid (Y/N)?`,
    },
    {
      type: 'answer',
      category: 'select',
      text: `Yes`,
    },
    {
      type: 'answer',
      category: 'select',
      text: `No`,
    },
  ],
  answer: 'single',
});

const q7 = new QuestionBox({
  entries: [
    {
      type: 'question',
      text: `When shall the purchase price be due?`,
    },
    {
      type: 'answer',
      category: 'select',
      text: ` upon signing of the contract?`,
    },
    {
      type: 'answer',
      category: 'select',
      text: `upon filing the assignment with the USPTO?`,
    },
    {
      type: 'answer',
      category: 'select',
      text: `upon the USPTO registering the assignment?`,
    },
  ],
  answer: 'single',
});

const q8 = new QuestionBox({
  entries: [
    {
      type: 'question',
      text: `Who is responsible for filing the assignment with the USPTO?`,
    },
    {
      type: 'answer',
      category: 'select',
      text: ` Assignor`,
    },
    {
      type: 'answer',
      category: 'select',
      text: `Assignee`,
    },
  ],
  answer: 'single',
});

q.render();
q2.render();
q3.render();
q4.render();
q5.render();
q6.render();
q7.render();
q8.render();
