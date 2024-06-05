import { useId, useState, } from 'react'

type UserDataT = {
  name: string,
  projectsNumber: number
}
type RepoDataT = {
  name: string,
  stargazersCount: number
}

type SelectOption = React.ComponentPropsWithoutRef<'option'> & {
  value: string | number,
  label: string
}

type SelectProps = React.ComponentPropsWithoutRef<'select'> & {
  label?: string
  name: string
  options: SelectOption[]
}

type InputProps = React.ComponentPropsWithoutRef<'input'> & {
  name: string,
  label?: string
}

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  children: React.ReactNode
}

type ListProps = {
  items: (UserDataT | RepoDataT)[],
}
type StatusT = 'idle' | 'pending';

const getUserInfo = async (nickname: string): Promise<UserDataT> => {

  const response = await fetch(`https://api.github.com/users/${nickname}`)


  if (!response.ok) {
    throw new Error('Something went wrong while fetch user info')
  }

  const { name, public_repos } = await response.json()

  return { name, projectsNumber: public_repos }
}

const getProjectData = async (repo: string): Promise<RepoDataT> => {

  const response = await fetch(`https://api.github.com/repos/${repo}`)


  if (!response.ok) {
    throw new Error('Something went wrong while fetch project info')
  }

  const { name, stargazers_count } = await response.json()

  return { name, stargazersCount: stargazers_count }
}


const Select = ({ name, label, options, ...rest }: SelectProps) => {
  const id = useId()

  return (
    <p>
      {label && <label htmlFor={id} >{label}</label>}

      <select {...rest} name={name} id={id}>
        {
          options.length ? options.map((option) => {
            return (
              <option key={option.value} {...option} >{option.label}</option>
            )
          }) :
            <option value=''>No options...</option>
        }

      </select>
    </p>

  )
}


const Input = ({ label, ...rest }: InputProps) => {
  const id = useId()

  return (
    <p>
      {label && <label htmlFor={id} >{label}</label>}
      <input {...rest} id={id} />
    </p>
  )
}



const Button = ({ children, ...rest }: ButtonProps) => {
  return (
    <button {...rest}>
      {children}
    </button>
  )
}

const isUserDataT = (item: UserDataT | RepoDataT): item is UserDataT => {

  return item &&
    "projectsNumber" in item

}

const isRepoDataT = (item: UserDataT | RepoDataT): item is RepoDataT => {

  return item &&
    "stargazersCount" in item

}


const List = ({ items }: ListProps) => {

  if (items.length === 0) {
    return <p>No items...</p>
  }
  return (

    <ul>
      {
        items.map((item, index) =>
          isUserDataT(item) ? <li key={index}>{renderUserData(item)}</li> :
            isRepoDataT(item) ? <li key={index}>{renderRepoData(item)}</li> : <li>test</li>
        )
      }
    </ul>
  )
}


const renderUserData = (user: UserDataT) => {

  return (
    <div>
      <p><span>Name: </span>{user.name} </p>
      <p><span>Project numbers: </span> {user.projectsNumber}</p>
    </div>
  )
}

const renderRepoData = (user: RepoDataT) => {

  return (
    <div>
      <p><span>Name: </span>{user.name} </p>
      <p><span>Project stars: </span> {user.stargazersCount}</p>
    </div>
  )
}

function App() {

  const [fetchData, setFetchData] = useState<(UserDataT | RepoDataT)[]>([])
  const [status, setStatus] = useState<StatusT>('idle')
  const [error, setError] = useState<Error | null>(null)


  const getInfo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const type = formData.get('type')
    const name = formData.get('name') as string


    if (type === 'repo') {
      try {

        setStatus('pending')
        const data = await getProjectData(name)
        setFetchData(prevstate => [...prevstate, data])
        form.reset()
        setError(null)

      } catch (error) {
        if (error instanceof Error) {
          setError(error)
        }

      }
    }
    if (type === 'user') {

      try {
        setStatus('pending')
        const data = await getUserInfo(name)
        setFetchData(prevstate => [...prevstate, data])
        form.reset()
        setError(null)
      } catch (error) {

        if (error instanceof Error) {
          setError(error)
        }


      }
    }
    setStatus('idle')
  }

  return (
    <>

      <form onSubmit={(event) => getInfo(event)}>
        <Select label='Pick type' name='type' options={[{ value: 'repo', label: 'repo' }, { value: 'user', label: 'user' }]} />
        <Input label='Name' name='name' type='text' />

        {error && status !== 'pending' && <p>{error?.message}</p>}
        <Button disabled={status === 'pending'}>Save</Button>
      </form>

      <div>
        {status === "pending" && <p>Loading...</p>}
        {status === "idle" && <List items={fetchData} />}
      </div>
    </>
  )
}

export default App
