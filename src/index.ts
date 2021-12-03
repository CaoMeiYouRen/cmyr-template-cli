import { Plop, run } from 'plop'
import { Command } from 'commander'
import minimist from 'minimist'
import path from 'path'
const program = new Command('ct')
    .description('草梅项目创建器')

program.version(process.env.VERSION || '1.0.0', '-v, --version')

const args = process.argv.slice(2)
const argv = minimist(args)
program.option('-d, --debug', 'debug')

const create = new Command('create')
    .description('创建项目')
    .action(() => {
        Plop.launch({
            cwd: argv.cwd,
            configPath: path.resolve(__dirname, './plopfile.js'),
            require: argv.require,
            completion: argv.completion,
        }, (env) => run(env, undefined, true),
        )
    })
program.addCommand(create)

program.parse(process.argv)

const opts = program.opts()

if (opts.debug) {
    console.log(argv)
    console.log(opts)
}
