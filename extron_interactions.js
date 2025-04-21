import { telnetResponse } from "./telnet.js";
import _ from 'lodash-es';

/**
 * Given an Extron device and an input, selects that input on the device.
 * @param {*} host Host IP Address for telnet connection to the device.
 * @param {*} port Port for telnet connection to the device. Default is 23.
 * @param {*} type Type of device. A switch has one output, a matrix could have several.
 * @param {*} input_idx 1-based index of the input to be selected on the given host device.
 * @returns {*} A TelnetResponse from the device running the selection command.
 */
export async function selectInput(host, port, type, input_idx) {
    // console.log(hostname, port, type, input_idx);
    let command = '';
    if (type === 'switch') {
        command = `${input_idx}!`;
    }
    else if (type === 'matrix') {
        command = `${input_idx}*2!`; // Output 2 is the upscaler that goes to my HDMI switch
    }
    const res = await telnetResponse({
        host,
        port,
    }, command);
    return res;
}

/**
 * Given an Extron device, returns the currently selected input for that device.
 * @param {*} host Host IP Address for telnet connection to the device.
 * @param {*} port Port for telnet connection to the device. Default is 23.
 * @param {*} type Type of device.
 * @returns The index of the selected input for the device - if the input is a matrix type
 * device, this only cares about output 2 and so that's which value it returns.
 */
export async function getInput(host, port, type) {
    let command = '';
    if (type === 'switch') {
        command = '!';
    }
    else if (type === 'matrix') {
        command = '2!'; //  Output 2 is the upscaler that goes to the HDMI switch
    }
    const res = await telnetResponse({
        host,
        port,
    }, command);
    return Number.parseInt(res);
}

/**
 * Resolves to the currently-selected game console for showing on the HDMI output
 * @param {*} switchers Config data about the switchers in the system
 * @param {*} console_inputs Config data about the console inputs in the system
 * @returns The currently selected console, determined by pinging all switchers in the
 * system to find their active inputs, and comparing that against a matching preset for
 * game consoles defined in the config data.
 */
export async function getCurrentGameConsole(switchers, console_inputs) {
    const current_map = {};
    // Fancy function to wait for multiple switcher results as a single promise.
    await Object.keys(switchers).reduce(async (promise, switch_id) => {
        // This line will wait for the last async function to finish.
        // The first iteration uses an already resolved Promise
        // so, it will immediately continue.
        await promise;
        const current_switch = switchers[switch_id];

        const switch_value = await getInput(
            current_switch.host,
            current_switch.port,
            current_switch.type
        );
        current_map[switch_id] = switch_value;
    }, Promise.resolve());

    let matching_console_id;
    matching_console_id = Object.keys(console_inputs).find((input_id) => {
        return _.isMatch(current_map, console_inputs[input_id].preset);
    });

    return matching_console_id;
}

function toggleMute(hostname, port) {

}

function toggleButtonLock(device_id) {

}

function getDeviceName(device_id) {

}

function getDeviceModelInfo(device_id) {

}
