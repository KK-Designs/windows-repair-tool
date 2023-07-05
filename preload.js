/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
window.onload = async () => {
	const { ipcRenderer } = require('electron');
	const { spawn } = require('child_process');
	const chkDsk = document.getElementById('chkDsk');
	const sfc = document.getElementById('sfc');
	const dism = document.getElementById('dism');
	const output = document.getElementById('output');
	let isElevated;
	try {
		isElevated = require('child_process').execSync('NET SESSION').toString().includes('Access is denied') ? false : true;
	} catch (error) {
		isElevated = false;
	}
	if (!isElevated) {
		alert('Please restart as admin');
		return await ipcRenderer.invoke('closeApp', true);
	}

	chkDsk.onclick = () => {
		const ls = spawn('chkdsk', ['/F']);
		chkDsk.disabled = true;
		sfc.disabled = true;
		dism.disabled = true;

		ls.stdout.on('data', (data) => {
			console.log(`stdout: ${data.toString()}`);
			if (data.toString().includes('Chkdsk cannot run')) {
				ls.stdin.write('Y\n');
			}
			output.innerHTML = data.toString();
		});

		ls.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
			output.innerHTML = data.toString();
		});

		ls.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
			chkDsk.disabled = false;
			sfc.disabled = false;
			dism.disabled = false;
			output.innerHTML = 'Operation finished successfully!';
		});
	};

	sfc.onclick = () => {
		const ls = spawn('sfc', ['/scannow']);
		chkDsk.disabled = true;
		sfc.disabled = true;
		dism.disabled = true;
		output.innerHTML = 'Starting SFC operation...';

		ls.stdout.on('data', (data) => {
			console.log(`stdout: ${data.toString()}`);
			output.innerHTML = data.toString();
		});

		ls.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
			output.innerHTML = data.toString();
		});

		ls.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
			chkDsk.disabled = false;
			sfc.disabled = false;
			dism.disabled = false;
			output.innerHTML = 'Operation finished successfully!';
		});
	};

	dism.onclick = () => {
		const ls = spawn('Dism', ['/Online', '/Cleanup-image', '/RestoreHealth']);
		chkDsk.disabled = true;
		sfc.disabled = true;
		dism.disabled = true;

		ls.stdout.on('data', (data) => {
			console.log(`stdout: ${data.toString()}`);
			output.innerHTML = data.toString();
		});

		ls.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
			output.innerHTML = data.toString();
		});

		ls.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
			chkDsk.disabled = false;
			sfc.disabled = false;
			dism.disabled = false;
			output.innerHTML = 'Operation finished successfully!';
		});
	};
};
