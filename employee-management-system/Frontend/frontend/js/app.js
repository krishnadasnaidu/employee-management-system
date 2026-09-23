'use strict';

/* =========================================================================
   CONFIGURATION
   ========================================================================= */

const API_BASE = 'http://localhost:8080/api/employees';


/* =========================================================================
   APPLICATION STATE
   ========================================================================= */

const state = {

  // All employees currently loaded from backend
  employees: [],

  // Search/filter result before pagination
  filteredEmployees: [],

  // Pagination
  currentPage: 1,
  pageSize: 10,

  // Sorting
  sortField: '',
  sortDirection: 'asc',

  // Current employee waiting for delete confirmation
  pendingDeleteId: null

};


/* =========================================================================
   API ERROR
   ========================================================================= */

class ApiError extends Error {

  constructor(message, status = 0, validationErrors = null, body = null) {

    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.validationErrors = validationErrors;
    this.body = body;

  }

}


/* =========================================================================
   API REQUEST
   ========================================================================= */

async function apiRequest(url, options = {}) {

  let response;

  try {

    response = await fetch(url, {

      ...options,

      headers: {

        'Content-Type': 'application/json',

        ...(options.headers || {})

      }

    });

  } catch (error) {

    throw new ApiError(
      'Unable to connect to the server. Please check your connection and try again.',
      0
    );

  }


  const raw = await response.text();

  let data = null;

  if (raw) {

    try {

      data = JSON.parse(raw);

    } catch {

      data = null;

    }

  }


  if (!response.ok) {

    let message = getFriendlyApiMessage(response.status, data);

    throw new ApiError(

      message,

      response.status,

      data?.validationErrors || null,

      data

    );

  }


  return data;

}


/* =========================================================================
   FRIENDLY API ERROR MESSAGES
   ========================================================================= */

function getFriendlyApiMessage(status, data) {

  if (data?.message) {

    return data.message;

  }

  switch (status) {

    case 400:
      return 'The information provided is invalid. Please check the form.';

    case 401:
      return 'You are not authorized to perform this action.';

    case 403:
      return 'You do not have permission to perform this action.';

    case 404:
      return 'The requested employee was not found.';

    case 409:
      return 'This employee information already exists.';

    case 422:
      return 'The submitted information could not be processed.';

    case 500:
      return 'The server encountered an error. Please try again later.';

    case 503:
      return 'The service is temporarily unavailable.';

    default:
      return `Request failed. Server returned status ${status}.`;

  }

}


/* =========================================================================
   HATEOAS HELPERS
   ========================================================================= */

function extractList(json) {

  // Normal JSON array response
  if (Array.isArray(json)) {

    return json;

  }

  // EmployeePageResponse from Spring Boot
  // Example:
  // {
  //   "employees": [ ... ],
  //   "currentPage": 0,
  //   "pageSize": 100,
  //   "totalElements": 20
  // }
  if (json && Array.isArray(json.employees)) {

    return json.employees;

  }

  // HATEOAS CollectionModel response
  // Example:
  // {
  //   "_embedded": {
  //     "employeeResponseDTOList": [ ... ]
  //   }
  // }
  if (json && typeof json === 'object' && json._embedded) {

    const values = Object.values(json._embedded);

    const array = values.find(
      value => Array.isArray(value)
    );

    return array || [];

  }

  return [];

}


function extractItem(json) {

  return json || null;

}


/* =========================================================================
   EMPLOYEE API
   ========================================================================= */

const EmployeeApi = {

  async getAll() {

  const params = new URLSearchParams({

    page: '0',

    size: '100',

    sort: 'id',

    direction: 'asc'

  });

  const json = await apiRequest(

    `${API_BASE}?${params.toString()}`,

    {
      method: 'GET'
    }

  );

  return extractList(json);

},


  async getById(id) {

    const json = await apiRequest(

      `${API_BASE}/${encodeURIComponent(id)}`,

      {
        method: 'GET'
      }

    );

    return extractItem(json);

  },


  async create(employee) {

    const json = await apiRequest(

      API_BASE,

      {
        method: 'POST',
        body: JSON.stringify(employee)
      }

    );

    return extractItem(json);

  },


  async createBulk(employees) {

    const json = await apiRequest(

      `${API_BASE}/bulk`,

      {
        method: 'POST',
        body: JSON.stringify(employees)
      }

    );

    return extractList(json);

  },


  async update(id, employee) {

    const json = await apiRequest(

      `${API_BASE}/${encodeURIComponent(id)}`,

      {
        method: 'PUT',
        body: JSON.stringify(employee)
      }

    );

    return extractItem(json);

  },


  async patch(id, employee) {

    const json = await apiRequest(

      `${API_BASE}/${encodeURIComponent(id)}`,

      {
        method: 'PATCH',
        body: JSON.stringify(employee)
      }

    );

    return extractItem(json);

  },


  async remove(id) {

    await apiRequest(

      `${API_BASE}/${encodeURIComponent(id)}`,

      {
        method: 'DELETE'
      }

    );

  },


  async removeAll() {

    await apiRequest(

      API_BASE,

      {
        method: 'DELETE'
      }

    );

  },


  async searchByDepartment(department) {

    const json = await apiRequest(

      `${API_BASE}/search/department?department=${encodeURIComponent(department)}`,

      {
        method: 'GET'
      }

    );

    return extractList(json);

  },


  async searchByStatus(status) {

    const json = await apiRequest(

      `${API_BASE}/search/status?status=${encodeURIComponent(status)}`,

      {
        method: 'GET'
      }

    );

    return extractList(json);

  },


  async searchByLastName(lastName) {

    const json = await apiRequest(

      `${API_BASE}/search/lastname?lastName=${encodeURIComponent(lastName)}`,

      {
        method: 'GET'
      }

    );

    return extractList(json);

  }

};


/* =========================================================================
   TOAST
   ========================================================================= */

function showToast(message, type = 'info') {

  const stack = document.getElementById('toast-stack');

  if (!stack) return;


  const toast = document.createElement('div');

  toast.className = `toast toast-${type}`;

  toast.textContent = message;

  stack.appendChild(toast);


  setTimeout(() => {

    toast.style.opacity = '0';

    toast.style.transition = 'opacity 0.3s ease';

    setTimeout(() => toast.remove(), 300);

  }, 3500);

}


/* =========================================================================
   BUTTON LOADING
   ========================================================================= */

function setButtonLoading(button, loading, text = 'Working...') {

  if (!button) return;


  if (loading) {

    button.dataset.originalText = button.textContent;

    button.disabled = true;

    button.innerHTML =
      `<span class="spinner"></span> ${text}`;

  } else {

    button.disabled = false;

    button.textContent =
      button.dataset.originalText || 'Submit';

  }

}


/* =========================================================================
   HTML ESCAPE
   ========================================================================= */

function escapeHtml(value) {

  if (value === null || value === undefined) {

    return '';

  }

  return String(value)

    .replace(/&/g, '&amp;')

    .replace(/</g, '&lt;')

    .replace(/>/g, '&gt;')

    .replace(/"/g, '&quot;')

    .replace(/'/g, '&#039;');

}


/* =========================================================================
   SALARY FORMAT
   ========================================================================= */

function formatSalary(value) {

  if (value === null || value === undefined || value === '') {

    return '—';

  }

  return Number(value).toLocaleString(

    'en-IN',

    {
      maximumFractionDigits: 2
    }

  );

}


/* =========================================================================
   STATUS BADGE
   ========================================================================= */

function statusBadge(status) {

  const map = {

    ACTIVE: ['badge-active', 'Active'],

    INACTIVE: ['badge-inactive', 'Inactive'],

    ON_LEAVE: ['badge-on-leave', 'On leave']

  };


  const result =
    map[status] ||
    ['badge-inactive', status || 'Unknown'];


  return `
    <span class="badge ${result[0]}">
      ${result[1]}
    </span>
  `;

}


/* =========================================================================
   NAVIGATION
   ========================================================================= */

function setActiveView(viewName) {

  document
    .querySelectorAll('.view')
    .forEach(view => {

      view.classList.toggle(

        'is-active',

        view.id === `view-${viewName}`

      );

    });


  document
    .querySelectorAll('.nav-item')
    .forEach(button => {

      button.classList.toggle(

        'is-active',

        button.dataset.view === viewName

      );

    });


  if (viewName === 'dashboard') {

    loadDashboard();

  }


  if (viewName === 'employees') {

    loadEmployees();

  }

}


document
  .querySelectorAll('.nav-item')
  .forEach(button => {

    button.addEventListener(

      'click',

      () => {

        setActiveView(button.dataset.view);

      }

    );

  });


/* =========================================================================
   ADD TABS
   ========================================================================= */

document
  .querySelectorAll('.tab-btn')
  .forEach(button => {

    button.addEventListener(

      'click',

      () => {

        document
          .querySelectorAll('.tab-btn')
          .forEach(btn =>
            btn.classList.remove('is-active')
          );


        document
          .querySelectorAll('.tab-pane')
          .forEach(pane =>
            pane.classList.remove('is-active')
          );


        button.classList.add('is-active');


        const pane =
          document.querySelector(
            `[data-tab-pane="${button.dataset.tab}"]`
          );


        if (pane) {

          pane.classList.add('is-active');

        }

      }

    );

  });


/* =========================================================================
   MODALS
   ========================================================================= */

function openModal(id) {

  const modal = document.getElementById(id);

  if (!modal) return;

  modal.hidden = false;

  document.body.classList.add('modal-open');

}


function closeModal(id) {

  const modal = document.getElementById(id);

  if (!modal) return;

  modal.hidden = true;

  document.body.classList.remove('modal-open');

}


document
  .querySelectorAll('[data-close-modal]')
  .forEach(button => {

    button.addEventListener(

      'click',

      () => {

        closeModal(button.dataset.closeModal);

      }

    );

  });


document
  .querySelectorAll('.modal-overlay')
  .forEach(overlay => {

    overlay.addEventListener(

      'click',

      event => {

        if (event.target === overlay) {

          closeModal(overlay.id);

        }

      }

    );

  });


document.addEventListener(

  'keydown',

  event => {

    if (event.key !== 'Escape') return;


    document
      .querySelectorAll('.modal-overlay:not([hidden])')
      .forEach(modal => {

        closeModal(modal.id);

      });

  }

);


/* =========================================================================
   FORM ERRORS
   ========================================================================= */

function clearFormErrors(form, box) {

  if (!form || !box) return;


  box.hidden = true;

  box.innerHTML = '';


  form
    .querySelectorAll('.field')
    .forEach(field =>
      field.classList.remove('has-error')
    );


  form
    .querySelectorAll('.field-error')
    .forEach(error =>
      error.textContent = ''
    );

}


function appendGeneralError(box, message) {

  let list = box.querySelector('ul');


  if (!list) {

    list = document.createElement('ul');

    box.appendChild(list);

  }


  const item = document.createElement('li');

  item.textContent = message;

  list.appendChild(item);

}


function renderFormErrors(form, box, error) {

  clearFormErrors(form, box);


  const errors = error.validationErrors;


  if (errors && Object.keys(errors).length) {

    let generalError = false;


    Object.entries(errors)
      .forEach(([field, message]) => {

        const span =
          form.querySelector(
            `[data-error-for="${field}"]`
          );


        if (span) {

          span.textContent = message;

          const fieldElement =
            span.closest('.field');

          if (fieldElement) {

            fieldElement.classList.add(
              'has-error'
            );

          }

        } else {

          appendGeneralError(
            box,
            `${field}: ${message}`
          );

          generalError = true;

        }

      });


    box.hidden = !generalError;


  } else {

    appendGeneralError(

      box,

      error.message ||
      'Something went wrong. Please try again.'

    );

    box.hidden = false;

  }

}


/* =========================================================================
   DASHBOARD
   ========================================================================= */

async function loadDashboard() {

  const departmentBox =
    document.getElementById('dept-breakdown');


  try {

    const employees =
      await EmployeeApi.getAll();


    document.getElementById(
      'stat-total'
    ).textContent = employees.length;


    document.getElementById(
      'stat-active'
    ).textContent =
      employees.filter(
        employee =>
          employee.status === 'ACTIVE'
      ).length;


    document.getElementById(
      'stat-onleave'
    ).textContent =
      employees.filter(
        employee =>
          employee.status === 'ON_LEAVE'
      ).length;


    document.getElementById(
      'stat-inactive'
    ).textContent =
      employees.filter(
        employee =>
          employee.status === 'INACTIVE'
      ).length;


    const departments = {};


    employees.forEach(employee => {

      const department =
        employee.department || 'Unspecified';


      departments[department] =
        (departments[department] || 0) + 1;

    });


    const entries =
      Object.entries(departments)
        .sort((a, b) => b[1] - a[1]);


    if (!entries.length) {

      departmentBox.innerHTML =
        '<p class="empty-hint">No employees yet.</p>';

      return;

    }


    const max =
      Math.max(...entries.map(item => item[1]));


    departmentBox.innerHTML =
      entries.map(([department, count]) => {

        const width =
          (count / max) * 100;


        return `

          <div class="dept-row">

            <span class="dept-name">
              ${escapeHtml(department)}
            </span>

            <div class="dept-bar-track">

              <div
                class="dept-bar-fill"
                style="width:${width}%"
              ></div>

            </div>

            <span class="dept-count">
              ${count}
            </span>

          </div>

        `;

      }).join('');


  } catch (error) {

    departmentBox.innerHTML =
      '<p class="empty-hint">Unable to load dashboard.</p>';

  }

}


/* =========================================================================
   LOAD EMPLOYEES
   ========================================================================= */

async function loadEmployees() {

  const tbody =
    document.getElementById('employee-tbody');

  const loading =
    document.getElementById('employee-loading');

  const empty =
    document.getElementById('employee-empty');


  tbody.innerHTML = '';

  empty.hidden = true;

  loading.hidden = false;


  try {

    const employees =
      await EmployeeApi.getAll();


    state.employees = employees;


    populateDepartmentFilter(employees);


    applyEmployeeView();


  } catch (error) {

    state.employees = [];

    state.filteredEmployees = [];


    tbody.innerHTML = `

      <tr>

        <td colspan="8">

          <div class="error-banner">

            ${escapeHtml(error.message)}

          </div>

        </td>

      </tr>

    `;


    updatePagination();


  } finally {

    loading.hidden = true;

  }

}


/* =========================================================================
   DEPARTMENT DROPDOWN
   ========================================================================= */

function populateDepartmentFilter(employees) {

  const select =
    document.getElementById('f-department');


  const currentValue =
    select.value;


  const departments =
    [...new Set(

      employees

        .map(employee =>
          employee.department
        )

        .filter(Boolean)

    )]

    .sort((a, b) =>
      String(a).localeCompare(String(b))
    );


  select.innerHTML = `

    <option value="">
      All departments
    </option>

  `;


  departments.forEach(department => {

    const option =
      document.createElement('option');


    option.value = department;

    option.textContent = department;


    select.appendChild(option);

  });


  if (

    departments.includes(currentValue)

  ) {

    select.value = currentValue;

  }

}


/* =========================================================================
   SEARCH + FILTER
   ========================================================================= */

function getSearchValue() {

  return document
    .getElementById('employee-search')
    .value
    .trim()
    .toLowerCase();

}


function applyEmployeeView() {

  const search =
    getSearchValue();


  const department =
    document
      .getElementById('f-department')
      .value
      .trim()
      .toLowerCase();


  const status =
    document
      .getElementById('f-status')
      .value;


  let results =
    state.employees.filter(employee => {


      /* Main search */

      if (search) {

        const searchable = [

          employee.id,

          employee.firstName,

          employee.lastName,

          `${employee.firstName || ''} ${employee.lastName || ''}`,

          employee.email,

          employee.department

        ]

        .filter(value =>
          value !== null &&
          value !== undefined
        )

        .map(value =>
          String(value).toLowerCase()
        );


        const matchesSearch =
          searchable.some(value =>
            value.includes(search)
          );


        if (!matchesSearch) {

          return false;

        }

      }


      /* Department filter */

      if (department) {

        if (

          String(employee.department || '')
            .toLowerCase() !== department

        ) {

          return false;

        }

      }


      /* Status filter */

      if (status) {

        if (employee.status !== status) {

          return false;

        }

      }


      return true;

    });


  results =
    sortEmployees(
      results,
      state.sortField,
      state.sortDirection
    );


  state.filteredEmployees = results;


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        results.length / state.pageSize
      )
    );


  if (state.currentPage > totalPages) {

    state.currentPage = totalPages;

  }


  renderEmployeeTable();

  updatePagination();

}


/* =========================================================================
   SORTING
   ========================================================================= */

function sortEmployees(
  employees,
  field,
  direction
) {

  if (!field) {

    return [...employees];

  }


  const sorted =
    [...employees];


  sorted.sort((a, b) => {

    let valueA;

    let valueB;


    switch (field) {

      case 'id':

        valueA = Number(a.id);

        valueB = Number(b.id);

        break;


      case 'name':

        valueA =
          `${a.firstName || ''} ${a.lastName || ''}`
            .toLowerCase();

        valueB =
          `${b.firstName || ''} ${b.lastName || ''}`
            .toLowerCase();

        break;


      case 'salary':

        valueA = Number(a.salary || 0);

        valueB = Number(b.salary || 0);

        break;


      case 'dateOfJoining':

        valueA =
          new Date(
            a.dateOfJoining || '1900-01-01'
          ).getTime();

        valueB =
          new Date(
            b.dateOfJoining || '1900-01-01'
          ).getTime();

        break;


      case 'email':

        valueA =
          String(a.email || '')
            .toLowerCase();

        valueB =
          String(b.email || '')
            .toLowerCase();

        break;


      case 'department':

        valueA =
          String(a.department || '')
            .toLowerCase();

        valueB =
          String(b.department || '')
            .toLowerCase();

        break;


      case 'status':

        valueA =
          String(a.status || '')
            .toLowerCase();

        valueB =
          String(b.status || '')
            .toLowerCase();

        break;


      default:

        return 0;

    }


    if (valueA < valueB) {

      return direction === 'asc'
        ? -1
        : 1;

    }


    if (valueA > valueB) {

      return direction === 'asc'
        ? 1
        : -1;

    }


    return 0;

  });


  return sorted;

}


/* =========================================================================
   RENDER EMPLOYEE TABLE
   ========================================================================= */

function renderEmployeeTable() {

  const tbody =
    document.getElementById(
      'employee-tbody'
    );


  const empty =
    document.getElementById(
      'employee-empty'
    );


  const total =
    state.filteredEmployees.length;


  const start =
    (state.currentPage - 1) *
    state.pageSize;


  const end =
    Math.min(
      start + state.pageSize,
      total
    );


  const pageEmployees =
    state.filteredEmployees.slice(
      start,
      end
    );


  document.getElementById(
    'record-count'
  ).textContent =
    `${total} record${total === 1 ? '' : 's'}`;


  if (!pageEmployees.length) {

    tbody.innerHTML = '';

    empty.hidden = false;

    updatePageSummary();

    return;

  }


  empty.hidden = true;


  tbody.innerHTML =
    pageEmployees.map(employee => `

      <tr data-id="${escapeHtml(employee.id)}">

        <td class="cell-id">
          ${escapeHtml(employee.id)}
        </td>

        <td class="cell-name">
          ${escapeHtml(employee.firstName)}
          ${escapeHtml(employee.lastName)}
        </td>

        <td class="cell-email">
          ${escapeHtml(employee.email)}
        </td>

        <td>
          ${escapeHtml(employee.department)}
        </td>

        <td class="cell-salary">
          ${formatSalary(employee.salary)}
        </td>

        <td class="cell-date">
          ${escapeHtml(employee.dateOfJoining)}
        </td>

        <td>
          ${statusBadge(employee.status)}
        </td>

        <td class="col-actions">

          <div class="actions-row">

            <button
              class="btn btn-ghost btn-icon-sm"
              data-action="view"
              data-id="${escapeHtml(employee.id)}"
              type="button"
            >
              View
            </button>

            <button
              class="btn btn-ghost btn-icon-sm"
              data-action="edit"
              data-id="${escapeHtml(employee.id)}"
              type="button"
            >
              Edit
            </button>

            <button
              class="btn btn-ghost btn-icon-sm"
              data-action="patch"
              data-id="${escapeHtml(employee.id)}"
              type="button"
            >
              Patch
            </button>

            <button
              class="btn btn-danger-outline btn-icon-sm"
              data-action="delete"
              data-id="${escapeHtml(employee.id)}"
              type="button"
            >
              Delete
            </button>

          </div>

        </td>

      </tr>

    `).join('');


  updatePageSummary();

}


/* =========================================================================
   PAGE SUMMARY
   ========================================================================= */

function updatePageSummary() {

  const total =
    state.filteredEmployees.length;


  const summary =
    document.getElementById(
      'page-summary'
    );


  if (!total) {

    summary.textContent =
      'Showing 0–0 of 0';

    return;

  }


  const start =
    (state.currentPage - 1) *
    state.pageSize + 1;


  const end =
    Math.min(
      state.currentPage *
      state.pageSize,
      total
    );


  summary.textContent =
    `Showing ${start}–${end} of ${total}`;

}


/* =========================================================================
   PAGINATION
   ========================================================================= */

function updatePagination() {

  const total =
    state.filteredEmployees.length;


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total / state.pageSize
      )
    );


  const previous =
    document.getElementById(
      'btn-prev-page'
    );


  const next =
    document.getElementById(
      'btn-next-page'
    );


  previous.disabled =
    state.currentPage <= 1;


  next.disabled =
    state.currentPage >= totalPages;


  const container =
    document.getElementById(
      'page-numbers'
    );


  container.innerHTML = '';


  if (totalPages <= 1) {

    updatePageSummary();

    return;

  }


  const maxButtons = 5;


  let startPage =
    Math.max(
      1,
      state.currentPage -
      Math.floor(maxButtons / 2)
    );


  let endPage =
    Math.min(
      totalPages,
      startPage + maxButtons - 1
    );


  if (
    endPage - startPage + 1 <
    maxButtons
  ) {

    startPage =
      Math.max(
        1,
        endPage - maxButtons + 1
      );

  }


  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {

    const button =
      document.createElement('button');


    button.type = 'button';

    button.className =
      'page-number';


    if (
      page === state.currentPage
    ) {

      button.classList.add(
        'is-active'
      );

    }


    button.textContent = page;


    button.addEventListener(
      'click',
      () => {

        state.currentPage = page;

        renderEmployeeTable();

        updatePagination();

      }
    );


    container.appendChild(button);

  }


  updatePageSummary();

}


/* =========================================================================
   PAGINATION EVENTS
   ========================================================================= */

document
  .getElementById('btn-prev-page')
  .addEventListener(
    'click',
    () => {

      if (state.currentPage <= 1) {

        return;

      }


      state.currentPage--;

      renderEmployeeTable();

      updatePagination();

    }
  );


document
  .getElementById('btn-next-page')
  .addEventListener(
    'click',
    () => {

      const totalPages =
        Math.max(
          1,
          Math.ceil(
            state.filteredEmployees.length /
            state.pageSize
          )
        );


      if (
        state.currentPage >= totalPages
      ) {

        return;

      }


      state.currentPage++;

      renderEmployeeTable();

      updatePagination();

    }
  );


document
  .getElementById('page-size')
  .addEventListener(
    'change',
    event => {

      state.pageSize =
        Number(event.target.value);


      state.currentPage = 1;

      renderEmployeeTable();

      updatePagination();

    }
  );


/* =========================================================================
   SEARCH
   ========================================================================= */

function runSearch() {

  state.currentPage = 1;

  applyEmployeeView();

}


document
  .getElementById('btn-search')
  .addEventListener(
    'click',
    runSearch
  );


document
  .getElementById('employee-search')
  .addEventListener(
    'keydown',
    event => {

      if (event.key === 'Enter') {

        event.preventDefault();

        runSearch();

      }

    }
  );


/* =========================================================================
   LIVE FILTERING
   ========================================================================= */

document
  .getElementById('f-department')
  .addEventListener(
    'change',
    () => {

      state.currentPage = 1;

      applyEmployeeView();

    }
  );


document
  .getElementById('f-status')
  .addEventListener(
    'change',
    () => {

      state.currentPage = 1;

      applyEmployeeView();

    }
  );


/* =========================================================================
   SORT DROPDOWN
   ========================================================================= */

document
  .getElementById('sort-field')
  .addEventListener(
    'change',
    event => {

      state.sortField =
        event.target.value;

      state.currentPage = 1;

      applyEmployeeView();

    }
  );


document
  .getElementById('sort-direction')
  .addEventListener(
    'change',
    event => {

      state.sortDirection =
        event.target.value;

      state.currentPage = 1;

      applyEmployeeView();

    }
  );


/* =========================================================================
   TABLE HEADER SORT
   ========================================================================= */

document
  .querySelectorAll('.table-sort-btn')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        const field =
          button.dataset.sort;


        if (state.sortField === field) {

          state.sortDirection =
            state.sortDirection === 'asc'
              ? 'desc'
              : 'asc';

        } else {

          state.sortField = field;

          state.sortDirection = 'asc';

        }


        document.getElementById(
          'sort-field'
        ).value =
          state.sortField;


        document.getElementById(
          'sort-direction'
        ).value =
          state.sortDirection;


        state.currentPage = 1;

        applyEmployeeView();

      }
    );

  });


/* =========================================================================
   CLEAR FILTERS
   ========================================================================= */

function clearFilters() {

  document.getElementById(
    'employee-search'
  ).value = '';


  document.getElementById(
    'f-department'
  ).value = '';


  document.getElementById(
    'f-status'
  ).value = '';


  document.getElementById(
    'sort-field'
  ).value = '';


  document.getElementById(
    'sort-direction'
  ).value = 'asc';


  state.sortField = '';

  state.sortDirection = 'asc';

  state.currentPage = 1;


  applyEmployeeView();

}


document
  .getElementById('btn-clear-filters')
  .addEventListener(
    'click',
    clearFilters
  );


document
  .getElementById('btn-empty-clear')
  .addEventListener(
    'click',
    clearFilters
  );


/* =========================================================================
   TABLE ACTIONS
   ========================================================================= */

document
  .getElementById('employee-tbody')
  .addEventListener(
    'click',
    event => {

      const button =
        event.target.closest(
          'button[data-action]'
        );


      if (!button) return;


      const id =
        button.dataset.id;


      const employee =
        state.employees.find(
          item =>
            String(item.id) ===
            String(id)
        );


      if (!employee) {

        showToast(
          'Employee record is no longer available.',
          'error'
        );

        return;

      }


      switch (
        button.dataset.action
      ) {

        case 'view':

          openViewModal(employee);

          break;


        case 'edit':

          openEditModal(employee);

          break;


        case 'patch':

          openPatchModal(employee);

          break;


        case 'delete':

          openDeleteModal(employee);

          break;

      }

    }
  );


/* =========================================================================
   VIEW EMPLOYEE
   ========================================================================= */

function openViewModal(employee) {

  const list =
    document.getElementById(
      'view-detail-list'
    );


  document.getElementById(
    'view-modal-title'
  ).textContent =
    `${employee.firstName || ''} ${employee.lastName || ''}`;


  list.innerHTML = `

    <dt>Employee ID</dt>
    <dd>${escapeHtml(employee.id)}</dd>

    <dt>First name</dt>
    <dd>${escapeHtml(employee.firstName)}</dd>

    <dt>Last name</dt>
    <dd>${escapeHtml(employee.lastName)}</dd>

    <dt>Email</dt>
    <dd>${escapeHtml(employee.email)}</dd>

    <dt>Department</dt>
    <dd>${escapeHtml(employee.department)}</dd>

    <dt>Salary</dt>
    <dd>${formatSalary(employee.salary)}</dd>

    <dt>Date of joining</dt>
    <dd>${escapeHtml(employee.dateOfJoining)}</dd>

    <dt>Status</dt>
    <dd>${statusBadge(employee.status)}</dd>

  `;


  const links =
    employee._links || {};


  const linksList =
    document.getElementById(
      'view-links-list'
    );


  const entries =
    Object.entries(links);


  if (!entries.length) {

    linksList.innerHTML =
      '<li class="empty-hint">No API links returned.</li>';

  } else {

    linksList.innerHTML =
      entries.map(
        ([relation, link]) => `

          <li>

            <span class="link-rel">
              ${escapeHtml(relation)}
            </span>

            <span class="link-href">
              ${escapeHtml(link.href)}
            </span>

          </li>

        `
      ).join('');

  }


  openModal('modal-view');

}


/* =========================================================================
   EDIT EMPLOYEE
   ========================================================================= */

const editForm =
  document.getElementById(
    'edit-form'
  );


const editErrorsBox =
  document.getElementById(
    'edit-form-errors'
  );


function openEditModal(employee) {

  clearFormErrors(
    editForm,
    editErrorsBox
  );


  document.getElementById(
    'edit-id'
  ).value =
    employee.id;


  document.getElementById(
    'edit-firstName'
  ).value =
    employee.firstName || '';


  document.getElementById(
    'edit-lastName'
  ).value =
    employee.lastName || '';


  document.getElementById(
    'edit-email'
  ).value =
    employee.email || '';


  document.getElementById(
    'edit-department'
  ).value =
    employee.department || '';


  document.getElementById(
    'edit-salary'
  ).value =
    employee.salary ?? '';


  document.getElementById(
    'edit-dateOfJoining'
  ).value =
    employee.dateOfJoining || '';


  document.getElementById(
    'edit-status'
  ).value =
    employee.status || 'ACTIVE';


  document.getElementById(
    'edit-modal-title'
  ).textContent =
    `Edit employee #${employee.id}`;


  openModal('modal-edit');

}


editForm.addEventListener(
  'submit',
  async event => {

    event.preventDefault();


    if (!editForm.reportValidity()) {

      return;

    }


    const id =
      document.getElementById(
        'edit-id'
      ).value;


    const payload = {

      firstName:
        document.getElementById(
          'edit-firstName'
        ).value.trim(),

      lastName:
        document.getElementById(
          'edit-lastName'
        ).value.trim(),

      email:
        document.getElementById(
          'edit-email'
        ).value.trim(),

      department:
        document.getElementById(
          'edit-department'
        ).value.trim(),

      salary:
        Number(
          document.getElementById(
            'edit-salary'
          ).value
        ),

      dateOfJoining:
        document.getElementById(
          'edit-dateOfJoining'
        ).value,

      status:
        document.getElementById(
          'edit-status'
        ).value

    };


    const button =
      document.getElementById(
        'edit-submit-btn'
      );


    setButtonLoading(
      button,
      true,
      'Saving...'
    );


    try {

      const updated =
        await EmployeeApi.update(
          id,
          payload
        );


      const index =
        state.employees.findIndex(
          employee =>
            String(employee.id) ===
            String(id)
        );


      if (index !== -1) {

        state.employees[index] =
          updated;

      }


      closeModal('modal-edit');


      showToast(
        'Employee updated successfully.',
        'success'
      );


      applyEmployeeView();

      loadDashboard();


    } catch (error) {

      renderFormErrors(
        editForm,
        editErrorsBox,
        error
      );


    } finally {

      setButtonLoading(
        button,
        false
      );

    }

  }
);


/* =========================================================================
   PATCH EMPLOYEE
   ========================================================================= */

const patchForm =
  document.getElementById(
    'patch-form'
  );


const patchErrorsBox =
  document.getElementById(
    'patch-form-errors'
  );


function openPatchModal(employee) {

  clearFormErrors(
    patchForm,
    patchErrorsBox
  );


  patchForm.reset();


  document.getElementById(
    'patch-id'
  ).value =
    employee.id;


  document.getElementById(
    'patch-modal-title'
  ).textContent =
    `Update fields — #${employee.id}`;


  document.getElementById(
    'patch-firstName'
  ).placeholder =
    employee.firstName || 'Unchanged';


  document.getElementById(
    'patch-lastName'
  ).placeholder =
    employee.lastName || 'Unchanged';


  document.getElementById(
    'patch-email'
  ).placeholder =
    employee.email || 'Unchanged';


  document.getElementById(
    'patch-department'
  ).placeholder =
    employee.department || 'Unchanged';


  document.getElementById(
    'patch-salary'
  ).placeholder =
    employee.salary ?? 'Unchanged';


  openModal('modal-patch');

}


patchForm.addEventListener(
  'submit',
  async event => {

    event.preventDefault();


    const id =
      document.getElementById(
        'patch-id'
      ).value;


    const payload = {};


    const firstName =
      document.getElementById(
        'patch-firstName'
      ).value.trim();


    const lastName =
      document.getElementById(
        'patch-lastName'
      ).value.trim();


    const email =
      document.getElementById(
        'patch-email'
      ).value.trim();


    const department =
      document.getElementById(
        'patch-department'
      ).value.trim();


    const salary =
      document.getElementById(
        'patch-salary'
      ).value;


    const dateOfJoining =
      document.getElementById(
        'patch-dateOfJoining'
      ).value;


    const status =
      document.getElementById(
        'patch-status'
      ).value;


    if (firstName)
      payload.firstName = firstName;


    if (lastName)
      payload.lastName = lastName;


    if (email)
      payload.email = email;


    if (department)
      payload.department = department;


    if (salary !== '')
      payload.salary = Number(salary);


    if (dateOfJoining)
      payload.dateOfJoining =
        dateOfJoining;


    if (status)
      payload.status = status;


    if (!Object.keys(payload).length) {

      showToast(
        'Enter at least one field to update.',
        'error'
      );

      return;

    }


    if (!patchForm.reportValidity()) {

      return;

    }


    const button =
      document.getElementById(
        'patch-submit-btn'
      );


    setButtonLoading(
      button,
      true,
      'Updating...'
    );


    try {

      const updated =
        await EmployeeApi.patch(
          id,
          payload
        );


      const index =
        state.employees.findIndex(
          employee =>
            String(employee.id) ===
            String(id)
        );


      if (index !== -1) {

        state.employees[index] =
          updated;

      }


      closeModal('modal-patch');


      showToast(
        'Employee updated successfully.',
        'success'
      );


      applyEmployeeView();

      loadDashboard();


    } catch (error) {

      renderFormErrors(
        patchForm,
        patchErrorsBox,
        error
      );


    } finally {

      setButtonLoading(
        button,
        false
      );

    }

  }
);


/* =========================================================================
   DELETE EMPLOYEE
   ========================================================================= */

function openDeleteModal(employee) {

  state.pendingDeleteId =
    employee.id;


  document.getElementById(
    'delete-confirm-copy'
  ).innerHTML = `

    Are you sure you want to delete

    <strong>
      ${escapeHtml(employee.firstName)}
      ${escapeHtml(employee.lastName)}
    </strong>

    (#${escapeHtml(employee.id)})?

    <br><br>

    <span class="danger-copy">
      This action cannot be undone.
    </span>

  `;


  openModal('modal-delete');

}


document
  .getElementById(
    'delete-confirm-btn'
  )
  .addEventListener(
    'click',
    async () => {

      const button =
        document.getElementById(
          'delete-confirm-btn'
        );


      if (
        state.pendingDeleteId === null
      ) {

        return;

      }


      setButtonLoading(
        button,
        true,
        'Deleting...'
      );


      try {

        await EmployeeApi.remove(
          state.pendingDeleteId
        );


        state.employees =
          state.employees.filter(
            employee =>
              String(employee.id) !==
              String(
                state.pendingDeleteId
              )
          );


        state.pendingDeleteId =
          null;


        closeModal('modal-delete');


        showToast(
          'Employee deleted successfully.',
          'success'
        );


        applyEmployeeView();

        loadDashboard();


      } catch (error) {

        showToast(
          error.message,
          'error'
        );


      } finally {

        setButtonLoading(
          button,
          false
        );

      }

    }
  );


/* =========================================================================
   DELETE ALL
   ========================================================================= */

document
  .getElementById(
    'btn-delete-all'
  )
  .addEventListener(
    'click',
    () => {

      document.getElementById(
        'delete-all-confirm-input'
      ).value = '';


      document.getElementById(
        'delete-all-confirm-btn'
      ).disabled = true;


      openModal(
        'modal-delete-all'
      );

    }
  );


document
  .getElementById(
    'delete-all-confirm-input'
  )
  .addEventListener(
    'input',
    event => {

      const value =
        event.target.value.trim();


      document.getElementById(
        'delete-all-confirm-btn'
      ).disabled =
        value !== 'DELETE';

    }
  );


document
  .getElementById(
    'delete-all-confirm-btn'
  )
  .addEventListener(
    'click',
    async () => {

      const button =
        document.getElementById(
          'delete-all-confirm-btn'
        );


      setButtonLoading(
        button,
        true,
        'Deleting...'
      );


      try {

        await EmployeeApi.removeAll();


        state.employees = [];

        state.filteredEmployees = [];

        state.currentPage = 1;


        closeModal(
          'modal-delete-all'
        );


        showToast(
          'All employees deleted successfully.',
          'success'
        );


        applyEmployeeView();

        loadDashboard();


      } catch (error) {

        showToast(
          error.message,
          'error'
        );


      } finally {

        setButtonLoading(
          button,
          false
        );

        button.disabled = true;

      }

    }
  );


/* =========================================================================
   ADD SINGLE EMPLOYEE
   ========================================================================= */

const addForm =
  document.getElementById(
    'add-form'
  );


const addErrorsBox =
  document.getElementById(
    'add-form-errors'
  );


addForm.addEventListener(
  'submit',
  async event => {

    event.preventDefault();


    if (!addForm.reportValidity()) {

      return;

    }


    const payload = {

      firstName:
        document.getElementById(
          'add-firstName'
        ).value.trim(),

      lastName:
        document.getElementById(
          'add-lastName'
        ).value.trim(),

      email:
        document.getElementById(
          'add-email'
        ).value.trim(),

      department:
        document.getElementById(
          'add-department'
        ).value.trim(),

      salary:
        Number(
          document.getElementById(
            'add-salary'
          ).value
        ),

      dateOfJoining:
        document.getElementById(
          'add-dateOfJoining'
        ).value,

      status:
        document.getElementById(
          'add-status'
        ).value

    };


    const button =
      document.getElementById(
        'add-submit-btn'
      );


    setButtonLoading(
      button,
      true,
      'Creating...'
    );


    try {

      await EmployeeApi.create(
        payload
      );


      clearFormErrors(
        addForm,
        addErrorsBox
      );


      addForm.reset();


      showToast(
        'Employee created successfully.',
        'success'
      );


      setActiveView(
        'employees'
      );


    } catch (error) {

      renderFormErrors(
        addForm,
        addErrorsBox,
        error
      );


    } finally {

      setButtonLoading(
        button,
        false
      );

    }

  }
);


/* =========================================================================
   BULK ADD
   ========================================================================= */

const bulkForm =
  document.getElementById(
    'bulk-form'
  );


const bulkErrorsBox =
  document.getElementById(
    'bulk-form-errors'
  );


bulkForm.addEventListener(
  'submit',
  async event => {

    event.preventDefault();


    bulkErrorsBox.hidden = true;

    bulkErrorsBox.innerHTML = '';


    const raw =
      document.getElementById(
        'bulk-json'
      ).value.trim();


    let employees;


    try {

      employees =
        JSON.parse(raw);


      if (!Array.isArray(employees)) {

        throw new Error();

      }


      if (!employees.length) {

        throw new Error();

      }

    } catch {

      appendGeneralError(

        bulkErrorsBox,

        'Please enter a valid non-empty JSON array.'

      );


      bulkErrorsBox.hidden = false;

      return;

    }


    const button =
      document.getElementById(
        'bulk-submit-btn'
      );


    setButtonLoading(
      button,
      true,
      'Creating...'
    );


    try {

      const created =
        await EmployeeApi.createBulk(
          employees
        );


      bulkForm.reset();


      showToast(
        `${created.length} employee${created.length === 1 ? '' : 's'} created successfully.`,
        'success'
      );


      setActiveView(
        'employees'
      );


    } catch (error) {

      if (
        error.validationErrors &&
        Object.keys(
          error.validationErrors
        ).length
      ) {

        Object.entries(
          error.validationErrors
        ).forEach(
          ([field, message]) => {

            appendGeneralError(

              bulkErrorsBox,

              `${field}: ${message}`

            );

          }
        );

      } else {

        appendGeneralError(

          bulkErrorsBox,

          error.message

        );

      }


      bulkErrorsBox.hidden = false;


    } finally {

      setButtonLoading(
        button,
        false
      );

    }

  }
);


/* =========================================================================
   API STATUS
   ========================================================================= */

async function checkApiStatus() {

  const dot =
    document.getElementById(
      'api-status-dot'
    );


  const text =
    document.getElementById(
      'api-status-text'
    );


  try {

    await EmployeeApi.getAll();


    dot.classList.add(
      'is-online'
    );


    dot.classList.remove(
      'is-offline'
    );


    text.textContent =
      'API connected';


  } catch {

    dot.classList.add(
      'is-offline'
    );


    dot.classList.remove(
      'is-online'
    );


    text.textContent =
      'API unreachable';

  }

}


/* =========================================================================
   INITIALIZATION
   ========================================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    checkApiStatus();

    loadDashboard();

  }
);