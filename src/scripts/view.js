import EventEmitter from "./services/event-emitter";
import debounce from "debounce";

export default class View extends EventEmitter {
	constructor() {
		super();

		this.formaState = {
			inputValue: "",
			selectDoneValue: "",
			selectPriorityValue: ""
		};

		this.page = document.querySelector(".page");
		this.form = document.querySelector(".form");
		this.modal = document.querySelector(".modal");
		this.editModal = document.querySelector(".modal-edit");
		this.notesGrid = document.querySelector(".notes-grid");
		this.inputSearch = this.form.querySelector(".input-search");
		this.selectDone = this.form.querySelector(".select-done");

		this.createModalForm = this.modal.querySelector(".modal-form");
		this.editModalForm = this.editModal.querySelector(".modal-form");

		this.addNoteBtn = document.querySelector('button[data-action="add-note"]');

		this.cancelEditBtn = document.querySelector(
			'button[data-action="edit-cancel"]'
		);
		this.cancelCreateBtn = document.querySelector(
			'button[data-action="create-cancel"]'
		);

		this.editSuccessBtn = document.querySelector(
			'.modal-edit button[data-action="edit-success"]'
		);

		this.notesGrid = document.querySelector(".notes-grid");

		this.addNoteBtn.addEventListener("click", this.openCreateModal.bind(this));

		this.createModalForm.addEventListener("submit", this.handleAdd.bind(this));
		this.editModalForm.addEventListener(
			"submit",
			this.handleEditSuccess.bind(this)
		);

		this.cancelEditBtn.addEventListener(
			"click",
			this.handleEditCancel.bind(this)
		);

		this.cancelCreateBtn.addEventListener(
			"click",
			this.handleCreateCancel.bind(this)
		);
		this.editSuccessBtn.addEventListener(
			"click",
			this.handleEditSuccess.bind(this)
		);

		this.inputSearch.addEventListener(
			"input",
			debounce(this.onInput.bind(this), 300)
		);
		this.selectDone.addEventListener(
			"change",
			this.onSelectDoneChange.bind(this)
		);

		this.addNote = this.addNote.bind(this);
		this.removeNote = this.removeNote.bind(this);
		this.updateNote = this.updateNote.bind(this);
		this.init = this.init.bind(this);
	}

	onInput(e) {
		// if (e.target.value === "") {
		// 	this.formaState.inputValue = "";
		// }
		this.formaState.inputValue = e.target.value;
		this.emit("filter", this.formaState);
	}

	onSelectDoneChange(e) {
		this.formaState.selectDoneValue = e.target.value;
		this.emit("filter", this.formaState);
	}

	handleFormChange(e) {
		console.log(e.target.value);
		let inputText = e.target.value;
		if (inputText === "") {
			this.emit("search-empty", inputText);
		}
		this.emit("filter", inputText);
	}

	handleAdd(e) {
		e.preventDefault();

		const title = this.modal.querySelector(".modal-input__title");
		const text = this.modal.querySelector(".input");
		const priority = this.modal.querySelector(".modal-select");

		if (text.value === "" || title.value === "") {
			alert("Please fill in all the fields");
		} else {
			const note = {
				title: title.value,
				text: text.value,
				priority: priority.value,
				done: "open"
			};

			this.emit("add", note);
			this.createModalForm.reset();
			this.closeCreateModal();
		}
	}

	handleEditCancel() {
		this.emit("edit-cancel");
	}

	handleCreateCancel() {
		this.emit("create-cancel");
	}

	handleEditSuccess(e) {
		e.preventDefault();

		const title = this.editModal.querySelector(".modal-input__title");
		const text = this.editModal.querySelector(".input");
		const priority = this.editModal.querySelector(".modal-select");

		const note = {
			title: title.value,
			text: text.value,
			priority: priority.value
		};

		this.emit("edit-success", note);
		this.editModalForm.reset();
		this.closeEditModal();
	}

	createNote(note) {
		const item = document.createElement("div");
		item.dataset.id = note.id;
		if (note.done === "done") {
			item.classList.add("done");
		}
		item.classList.add("item");

		const itemTitle = document.createElement("h2");
		itemTitle.textContent = note.title;
		itemTitle.classList.add("item-title");

		const text = document.createElement("p");
		text.textContent = note.text;
		text.classList.add("text");

		const buttonsWrap = document.createElement("div");
		buttonsWrap.classList.add("buttonsWrap");

		const priority = document.createElement("span");
		priority.textContent = note.priority;
		priority.classList.add("priority");

		const dropdown = document.createElement("div");
		dropdown.textContent = "...";
		dropdown.dataset.action = "toggle-dropdown";
		dropdown.classList.add("dropdown");

		const dropdownBtnWrap = document.createElement("div");
		dropdownBtnWrap.classList.add("dropdownBtnWrap");

		const buttonDone = document.createElement("button");
		buttonDone.textContent = "Done";
		buttonDone.dataset.action = "done";
		buttonDone.classList.add("button");
		buttonDone.classList.add("dropBtn");

		const buttonEdit = document.createElement("button");
		buttonEdit.textContent = "Edit";
		buttonEdit.dataset.action = "edit";
		buttonEdit.classList.add("button");
		buttonEdit.classList.add("dropBtn");

		const buttonRemove = document.createElement("button");
		buttonRemove.textContent = "Remove";
		buttonRemove.dataset.action = "remove";
		buttonRemove.classList.add("button");
		buttonRemove.classList.add("dropBtn");

		buttonsWrap.append(priority, dropdown);

		dropdown.append(dropdownBtnWrap);
		dropdownBtnWrap.append(buttonDone, buttonEdit, buttonRemove);
		item.append(itemTitle, text, buttonsWrap);

		this.appendEventListners(item);

		return item;
	}

	addNote(note) {
		const item = this.createNote(note);
		this.notesGrid.appendChild(item);
	}

	appendEventListners(item) {
		const removeBtn = item.querySelector('[data-action="remove"]');
		const editStartBtn = item.querySelector('[data-action="edit"]');
		const dropdown = item.querySelector('div[data-action="toggle-dropdown"]');
		const doneBtn = item.querySelector('button[data-action="done"]');

		removeBtn.addEventListener("click", this.handleRemove.bind(this));
		editStartBtn.addEventListener("click", this.handleEditStart.bind(this));
		dropdown.addEventListener("click", this.toggleDropdown.bind(this));
		doneBtn.addEventListener("click", this.handleDoneStatus.bind(this));
	}

	handleDoneStatus(e) {
		e.stopPropagation();
		const item = e.target.closest(".item");
		this.emit("done", item);
	}

	toggleDoneStatus(item) {
		const dropdown = item.querySelector(".dropdownBtnWrap");

		item.classList.toggle("done");
		dropdown.classList.remove("show-dropdown");
	}

	toggleDropdown(e) {
		e.target.firstElementChild.classList.toggle("show-dropdown");
	}

	handleEditStart(e) {
		e.stopPropagation();

		const parent = e.target.closest(".item");
		const dropdown = e.target.closest(".dropdownBtnWrap");

		dropdown.classList.remove("show-dropdown");
		this.emit("edit-start", parent.dataset.id);
	}

	handleRemove(e) {
		const parent = e.target.closest(".item");
		const dropdown = e.target.closest(".dropdownBtnWrap");

		dropdown.classList.remove("show-dropdown");
		e.stopPropagation();
		this.emit("remove", parent.dataset.id);
	}

	removeNote(id) {
		const item = this.notesGrid.querySelector(`[data-id="${id}"]`);
		this.notesGrid.removeChild(item);
	}

	openEditModal(note) {
		this.page.classList.add("show-edit-modal");

		const title = this.editModal.querySelector(".modal-input__title");
		const text = this.editModal.querySelector(".input");
		const priority = this.editModal.querySelector(".modal-select");

		text.value = note.text;
		title.value = note.title;
		priority.value = note.priority;
	}

	openCreateModal() {
		this.page.classList.add("show-modal");
	}

	closeCreateModal() {
		this.page.classList.remove("show-modal");
	}

	closeEditModal() {
		this.page.classList.remove("show-edit-modal");
	}

	updateNote(id, { title, text, priority }) {
		const elText = this.notesGrid.querySelector(`.item[data-id="${id}"] .text`);
		const elTitle = this.notesGrid.querySelector(
			`.item[data-id="${id}"] .item-title`
		);
		const elPriority = this.notesGrid.querySelector(
			`.item[data-id="${id}"] .priority`
		);

		elText.textContent = text;
		elTitle.textContent = title;
		elPriority.textContent = priority;
	}

	init(notes) {
		this.notesGrid.innerHTML = "";
		const elements = notes.map(note => this.createNote(note));
		this.notesGrid.append(...elements);
	}

	nothingFound() {
		this.notesGrid.innerHTML = "";
		const h2 = document.createElement("h2");
		h2.classList.add("nothing-found");
		h2.textContent = "Nothing found";
		this.notesGrid.append(h2);
	}
}
