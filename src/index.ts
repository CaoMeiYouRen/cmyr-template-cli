import path from 'path'
import { Plop, run } from 'plop'
import { Command } from 'commander'
import minimist from 'minimist'
import fs from 'fs-extra'
import { loadTemplateCliConfig } from './utils/config'
import { aiUpdateCommand } from './commands/ai-update'

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

const aiUpdate = new Command('ai-update')
    .description('更新 AI 基建快照（技能/代理/植入清单）')
    .option('-p, --path <path>', '项目路径（默认当前目录）', process.cwd())
    .action(async (opts: { path: string }) => {
        try {
            const config = await loadTemplateCliConfig()
            await aiUpdateCommand(opts.path, config)
            process.exit(0)
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })

program.addCommand(aiUpdate)

program.parse(process.argv)

const opts = program.opts()

if (opts.debug) {
    console.log(args)
    console.log(argv)
    console.log(opts)
}
