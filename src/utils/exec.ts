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
    return new Promise((resolve, reject) => {
        const ls = exec(cmd, options, (err, stdout: string, stderr: string) => {
            if (err) {
                return reject(err)
            }
            if (stderr) {
                return resolve(stderr)
            }
            resolve(stdout)
        })
        ls.stdout.on('data', (data) => {
            console.log(data)
        })
        ls.stderr.on('data', (data) => {
            console.log(colors.red(data))
        })
    })
}
