import { Plop, run } from 'plop'
import { Command } from 'commander'
import minimist from 'minimist'
import path from 'path'
import fs from 'fs-extra'

const program = new Command('ct')
    .description('草梅项目创建器')

const pkg = fs.readJSONSync(path.join(__dirname, '../package.json'))
program.version(pkg?.version || '1.0.0', '-v, --version')

const args = process.argv.slice(2)

if (args.length === 0) { // 如果只传入了 ct，则默认执行 ct create
    args.push('create')
    process.argv.push('create')
}

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
    console.log(args)
    console.log(argv)
    console.log(opts)
}
