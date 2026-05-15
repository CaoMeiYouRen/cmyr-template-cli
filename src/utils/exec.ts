import { exec, ExecOptions } from 'child_process'
import colors from '@colors/colors'

/**
 * 执行命令行
 *
 * @author CaoMeiYouRen
 * @date 2020-12-05
 * @export
 * @param {string} cmd
 * @returns
 */
export async function asyncExec(cmd: string, options?: ExecOptions) {
    return new Promise<string>((resolve, reject) => {
        const ls = exec(cmd, options ?? {}, (err, stdout, stderr) => {
            if (err) {
                return reject(err)
            }
            const stdoutText = typeof stdout === 'string' ? stdout : stdout.toString()
            const stderrText = typeof stderr === 'string' ? stderr : stderr.toString()
            const combinedOutput = [stdoutText, stderrText].filter(Boolean).join('').trimEnd()
            resolve(combinedOutput || stdoutText || stderrText)
        })
        ls.stdout?.on('data', (data) => {
            console.log(data)
        })
        ls.stderr?.on('data', (data) => {
            console.log(colors.red(data))
        })
    })
}
