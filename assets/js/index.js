const cardContainer = document.querySelector(".processSelectionCard")
let selectedProcess = null;

/**
 * @param {*} callback
 * @param {Number} delay 
 * @returns 
 */

// giving new name to setTimeout
const delayExecution = (callback, delay) => window.setTimeout(callback, delay);

// Render First HTML Card where user chooses to encrypt/decrypt
const processActionHtml = () => {
	return `<div class="cardHeadline">iPrep Tools</div>\
	<div class="cardTitle">Please select one option</div>\
	<div class="cardAction">\
		<div class="encrypt universalButton">Encrypt</div>\
		<div class="decrypt universalButton">Decrypt</div>\
	</div>`
}

// Render HTML based on selected on selected process
const selectedProcessHTML = (selectedProcess) => {
	return new Promise((resolve, reject) => {
		try {
			resolve(`<div class="cardHeadline">iPrep Tools</div>\
			<div class="selectedProcess">${selectedProcess}</div>\
			<div class="cardHtml">Please click on the button and select the offline <br /> folder you want to Encrypt</div>\
			<div class="cardAction processCardAction">\
				<label for="fileInput" class="selectFiles universalButton">Select Files</label>
				<input id="fileInput" class="selectedFile" type="file" multiple="multiple" name="fileInput" />\
				<div class="selectFileLocation">Select Files</div>\
			</div>\
			<div class="universalButton hidden startProcessButton">Start</div>`);
		} catch (error) {
			reject(error)
		}
	});
}

/**
 * @param {String} title
 * @param {String} message 
 */

// show Animated Error Alert
const showError = (
	title = "Some Error Occured",
	message = "Some Unexpected Error Occured. Kindly Connect to Site Administrator"
) => {
	// error HTML with dynamic title and message
	const errorHtml = `<div class="errorContainer hidden">\
		<div class="errorCard">\
			<img src="/assets/images/error.png" alt="error" id="errorImage" />
			<h2 id="errorTitle">${title}</h2>\
			<div id="errorMessage">${message}</div>
		</div>\
	</div>`

	// append error HTML at the end of the body
	document.body.innerHTML = errorHtml + document.body.innerHTML;

	/** @type {HTMLDivElement} */
	const errorContainer = document.querySelector(".errorContainer")
	/** @type {HTMLDivElement} */
	const errorCard = errorContainer.querySelector(".errorCard")
	// animating error container
	if (errorContainer.classList.contains("hidden")) {
		errorContainer.classList.remove("hidden")
		setTimeout(() => {
			errorContainer.style.cssText = "visibility: visible; opacity: 1;";
		}, 500)
		delayExecution(() => { errorCard.style.cssText = "opacity: 1; transform: translate(0px) rotateX(0deg)" }, 700)
	}
}
// Adding Click Event to Hide Error Card on Backdrop Click;
document.addEventListener('click', (e) => {
	if (e.target.classList.contains("errorContainer")) {
		document.body.removeChild(document.querySelector(".errorContainer"));
	}
})

/**
 * 
 * @param {File} file 
 * @param {String} methodType
 */

const uploadFile = async (file, methodType) => {
	try {
		let fd = new FormData()
		fd.append('fileToProcess', file);

		return await fetch(`/api/${methodType}`, {
			method: "POST",
			body: fd
		}).then(async (res) => {
			if (res.status != 200 && res.status != 302) {
				throw Error((await res.json())?.error)
			}

			return res.json()
		}).then((res) => {
			return res;
		}).catch(e => {
			showError(undefined, e.message);
		});
	} catch (error) {
		showError(undefined, error.message);
	}
}

/**
 * 
 * @param {Array} files
 */

const startProcess = async (files) => {
	try {
		let uploadPromiseArray = [];
		let methodType = selectedProcess == "Encryption" ? 'encrypt' : 'decrypt';
		// create a promise array for single upload file request
		files.forEach((file) => uploadPromiseArray.push(uploadFile(file, methodType)));
		const responseArray = await Promise.allSettled(uploadPromiseArray);
		responseArray.forEach((singleResposne) => {
			const fileMeta = singleResposne.value?.file
			if (fileMeta) {
				const fileName = fileMeta.path.split("/")[2].split(".")[0];
				const fileExtenstion = fileMeta.path.split("/")[2].split(".")[1];

				let downloadLink = document.createElement("a");
				downloadLink.setAttribute("class", "downloadUrl");
				downloadLink.href = `${window.location.origin}${fileMeta.path}`;
				downloadLink.innerHTML = `Download ${fileName}.${fileExtenstion}`;
				downloadLink.setAttribute("download", `${fileName}_${methodType}_.${fileExtenstion}`);
				document.body.append(downloadLink);
			}
		})
	} catch (error) {
		showError(undefined, error.message);
	}
}

/**
 * @param {HTMLInputElement} fileInputElement
 * 
 */

const fileInputOnChange = (fileInputElement) => {
	// Adding a change event which is triggered when the data inside changes
	fileInputElement.addEventListener('change', function () {
		const startProcessButton = document.querySelector(".startProcessButton");
		document.querySelector(".selectFileLocation").innerHTML = this.value // setting location of file as innerHTML
		startProcessButton.addEventListener('click', () => startProcess(Array.from(fileInputElement.files))); // add click event to Start Process
		// check if input contains files and change UI accordingly
		if (this.files.length > 0) {
			if (startProcessButton.classList.contains("hidden")) {
				// animating height is not recommended but if one must use it then it should be a fixed number
				cardContainer.style.minHeight = `${cardContainer.clientHeight + startProcessButton.clientHeight + 30}px`
				// animating the display property via use of visibility
				startProcessButton.classList.remove("hidden");
				delayExecution(() => { startProcessButton.style.cssText = "visibility: visible; opacity: 1" }, 300)
			}
		} else {
			// if no files are present in input attribute hide the start process button
			if (!startProcessButton.classList.contains("hidden")) {
				cardContainer.removeAttribute("style");
				startProcessButton.removeAttribute("style")
				// animating the display property via use of visibility
				delayExecution(() => { startProcessButton.classList.add("hidden") }, 300)
				document.querySelector(".selectFileLocation").innerHTML = "Select Files";
			}
		}
	});
}

// adding event listner to trigger HTML Rendering when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
	cardContainer.innerHTML = processActionHtml();
	// action selection ==> encrypt/decrypt
	document.querySelectorAll(".universalButton")?.forEach((ele) => {
		// conditional addition of event listner using ? in which if the value is valid
		ele?.addEventListener('click', async () => {
			selectedProcess = ele.innerHTML == "Encrypt" ? "Encryption" : "Decryption";
			selectedProcessHTML(selectedProcess).then((res) => {
				cardContainer.innerHTML = res;
				const fileInputElement = cardContainer.querySelector("#fileInput")
				fileInputOnChange(fileInputElement);
			}).catch((e) => {
				showError(undefined, e.message)
			});
		});
	});
});