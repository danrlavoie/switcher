import path from 'path';
import config from './extron.json' with { type: "json" };
import { selectInput, getCurrentGameConsole } from './extron_interactions.js';
import Fastify from 'fastify';

const fastify = Fastify({
    logger: true,
});

fastify.register(import('@fastify/static'), {
    root: path.join(import.meta.dirname, 'public'),
  })

fastify.get('/', async function handler(request, reply) {
    const { action } = request.query;
    if (action === 'select') {
        const input = config.console_inputs[request.query.input_id];
        // Given the preset, update all devices that need new input selections
        Object.keys(input.preset).forEach(async device_id => {
            const device = config.switchers[device_id];
            await selectInput(device.host, device.port, device.type, input.preset[device_id]);
        });
    }
    // Send static content
    return reply.sendFile('index.html')
});

/**
 * The details of the current console input that is active
 */
fastify.get('/inputs/active', async (request, reply) => {
    const active_id = await getCurrentGameConsole(config.switchers, config.console_inputs);
    const result = {
        id: active_id,
        name: config.console_inputs[active_id].name,
    };
    return result;
})

/**
 * The config details for the given ID
 */
fastify.get('/inputs/:input_id', async (request, reply) => {
    const input = config.console_inputs[request.params.input_id];
    return { result: input };
});

/**
 * Given an input ID, directly select that to be the active input
 */
fastify.get('/inputs/:input_id/select', async (request, reply) => {
    const input = config.console_inputs[request.params.input_id];
    Object.keys(input.preset).forEach(device_id => {
        const device = config.switchers[device_id];
        selectInput(device.host, device.port, device.type, input.preset[device_id]);
    });
    return { result: 'OK' };
});

// Run the server
try {
    const args = process.argv.slice(2);
    let host;
    if (args[0] && args[0] === "docker") {
        host = "0.0.0.0";
    }
    // console.log(config.switchers);
    await fastify.listen({ port: 3000, host });
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}