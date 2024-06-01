import React from "react"
import CategorySelect from "misago/components/category-select"
import Form from "misago/components/form"
import * as attachments from "./utils/attachments"
import { getPostValidators, getTitleValidators } from "./utils/validators"
import ajax from "misago/services/ajax"
import posting from "misago/services/posting"
import snackbar from "misago/services/snackbar"
import MarkupEditor from "../MarkupEditor"
import { Toolbar, ToolbarItem, ToolbarSection } from "../Toolbar"
import PostingDialog from "./PostingDialog"
import PostingDialogBody from "./PostingDialogBody"
import PostingDialogError from "./PostingDialogError"
import PostingDialogHeader from "./PostingDialogHeader"
import PostingThreadOptions from "./PostingThreadOptions"
import Select from "misago/components/select"

export default class extends Form {

  constructor(props) {
    super(props)
    this.types = [
      {
        value: "Provide",
        label: pgettext(
          "post thread",
          "Providing"
        ),
      },
      {
        value: "Seek",
        label: pgettext(
          "post thread",
          "Seeking"),
      }
    ]
    this.state = {
      isReady: false,
      isLoading: false,

      error: null,

      minimized: false,
      fullscreen: false,

      options: null,

      title: "",
      type: this.types[0],
      from: "",
      to: "",
      at: "",
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      date: new Date().toISOString().split('T')[0],
      seats_pay: 0,
      room_pay: 0,
      no_of_seats: 1,
      no_of_room: 1,
      category: props.category || null,
      categories: [],
      post: "",
      attachments: [],
      close: false,
      hide: false,
      pin: 0,

      validators: {
        title: getTitleValidators(),
        post: getPostValidators(),
      },
      errors: {},
    }
  }

  componentDidMount() {
    ajax.get(this.props.config).then(this.loadSuccess, this.loadError)
  }

  loadSuccess = (data) => {
    let category = null
    let options = null

    // hydrate categories, extract posting options
    const categories = data.map((item) => {
      // pick first category that allows posting and if it may, override it with initial one
      if (
        item.post !== false &&
        (!category || item.id == this.state.category)
      ) {
        category = item.id
        options = item.post
      }

      return Object.assign(item, {
        disabled: item.post === false,
        label: item.name,
        value: item.id,
      })
    })

    this.setState({
      isReady: true,
      options,

      categories,
      category,
    })
  }

  loadError = (rejection) => {
    this.setState({
      error: rejection.detail,
    })
  }

  onCancel = () => {
    const formEmpty = !!(
      this.state.post.length === 0 &&
      this.state.title.length === 0 &&
      this.state.attachments.length === 0
    )

    if (formEmpty) {
      this.minimize()
      return posting.close()
    }

    const cancel = window.confirm(
      pgettext("post thread", "Are you sure you want to discard thread?")
    )
    if (cancel) {
      this.minimize()
      posting.close()
    }
  }

  onTitleChange = (event) => {
    this.changeValue("title", event.target.value)
  }

  onNumberFieldSelected = (event) => {
    if (event.target.value == 0) {
      event.target.value = ""
    }
  }
  onNumberFieldDeSelected = (event) => {
    console.log(event.target.value)
    if (event.target.value == "") {
      event.target.value = 0
    } else {
      event.target.value = parseInt(event.target.value)
    }
  }

  onTypeChange = (event) => {
    const selectedType = this.types.find(type => type.value === event.target.value);
    console.log(selectedType);
    this.setState({
      type: selectedType
    })

    this.changeValue("title", "[" + event.target.value + "]: seats " + this.state.no_of_seats +
      " from/" + this.state.from + " to/" + this.state.to +
      " on date/" + this.state.date + (this.state.seats_pay == 0 ? " for free" : " with payment (AUD): " + this.state.seats_pay))
  }
  onFromChange = (event) => {
    this.changeValue("from", event.target.value)
    //change value of title into x
    this.changeValue("title", "[" + this.state.type.value + "] seats " + this.state.no_of_seats +
      " from/" + event.target.value + " to/" + this.state.to +
      " on date/" + this.state.date + (this.state.seats_pay == 0 ? " for free" : " with payment (AUD): " + this.state.seats_pay))
  }
  onToChange = (event) => {
    this.changeValue("to", event.target.value)
    this.changeValue("title", "[" + this.state.type.value + "] seats " + this.state.no_of_seats +
      " from/" + this.state.from + " to/" + event.target.value +
      " on date/" + this.state.date + (this.state.seats_pay == 0 ? " for free" : " with payment (AUD): " + this.state.seats_pay))
  }
  onDateChange = (event) => {
    this.changeValue("date", event.target.value)
    this.changeValue("title", "[" + this.state.type.value + "] seats " + this.state.no_of_seats +
      " from/" + this.state.from + " to/" + this.state.to +
      " on date/" + event.target.value + (this.state.seats_pay == 0 ? " for free" : " with payment (AUD): " + this.state.seats_pay))
  }
  onSeatsPayChange = (event) => {
    this.changeValue("seats_pay", event.target.value)
    this.changeValue("title", "[" + this.state.type.value + "] seats " + this.state.no_of_seats +
      " from/" + this.state.from + " to/" + this.state.to +
      " on date/" + this.state.date + (event.target.value == 0 ? " for free" : " with payment (AUD): " + event.target.value))
  }
  onNoOfseatsChange = (event) => {
    this.changeValue("no_of_seats", event.target.value)
    this.changeValue("title", "[" + this.state.type.value + "] rooms " + event.target.value +
      " from/" + this.state.from + " to/" + this.state.to +
      " on date/" + this.state.date + (this.state.seats_pay == 0 ? " for free" : " with payment (AUD): " + this.state.seats_pay))
  }

  onRoomPayChange = (event) => {
    this.changeValue("room_pay", event.target.value)
    this.changeValue("title", "[" + this.state.type.value + "] rooms " + this.state.no_of_room +
      " at/" + this.state.at + " start/" + this.state.start +
      " end/" + this.state.end + (event.target.value == 0 ? " for free" : " with payment (AUD): " + event.target.value))
  }
  onNoOfRoomChange = (event) => {
    this.changeValue("no_of_room", event.target.value)
    this.changeValue("title", "[" + this.state.type.value + "] rooms " + event.target.value +
      " at/" + this.state.at + " start/" + this.state.start +
      " end/" + this.state.end + (this.state.room_pay == 0 ? " for free" : " with payment (AUD): " + this.state.room_pay))
  }
  onAtChange = (event) => {
    this.changeValue("at", event.target.value)
    this.changeValue("title", "[" + this.state.type.value + "] rooms " + this.state.no_of_room +
      " at/" + event.target.value + " start/" + this.state.start +
      " end/" + this.state.end + (this.state.room_pay == 0 ? " for free" : " with payment (AUD): " + this.state.room_pay))
  }
  onStartChange = (event) => {
    this.changeValue("start", event.target.value)
    this.changeValue("title", "[" + this.state.type.value + "] rooms " + this.state.no_of_room +
      " at/" + this.state.at + " start/" + event.target.value +
      " end/" + this.state.end + (this.state.room_pay == 0 ? " for free" : " with payment (AUD): " + this.state.room_pay))
  }
  onEndChange = (event) => {
    this.changeValue("end", event.target.value)
    this.changeValue("title", "[" + this.state.type.value + "] rooms " + this.state.no_of_room +
      " at/" + this.state.at + " start/" + this.state.start +
      " end/" + event.target.value + (this.state.room_pay == 0 ? " for free" : " with payment (AUD): " + this.state.room_pay))
  }
  onCategoryChange = (event) => {
    const category = this.state.categories.find((item) => {
      return event.target.value == item.value
    })
    // if selected pin is greater than allowed, reduce it
    let pin = this.state.pin
    if (category.post.pin && category.post.pin < pin) {
      pin = category.post.pin
    }

    this.setState({
      category: category.id,
      categoryOptions: category.post,

      pin,
    })
  }

  onPostChange = (event) => {
    this.changeValue("post", event.target.value)
  }

  onAttachmentsChange = (attachments) => {
    this.setState(attachments)
  }

  onClose = () => {
    this.changeValue("close", true)
  }

  onOpen = () => {
    this.changeValue("close", false)
  }

  onPinGlobally = () => {
    this.changeValue("pin", 2)
  }

  onPinLocally = () => {
    this.changeValue("pin", 1)
  }

  onUnpin = () => {
    this.changeValue("pin", 0)
  }

  onHide = () => {
    this.changeValue("hide", true)
  }

  onUnhide = () => {
    this.changeValue("hide", false)
  }

  close = () => {
    this.minimize()
    posting.close()
  }

  minimize = () => {
    this.setState({ fullscreen: false, minimized: true })
  }

  open = () => {
    this.setState({ minimized: false })
    if (this.state.fullscreen) {
    }
  }

  fullscreenEnter = () => {
    this.setState({ fullscreen: true, minimized: false })
  }

  fullscreenExit = () => {
    this.setState({ fullscreen: false, minimized: false })
  }

  renderWidgetsCategory = () => {
    switch (this.state.category) {
      case 5:
        return <div>
          <ToolbarSection auto>
            <ToolbarItem shrink>
              <label>
                {pgettext("post thread", "I'm")}
              </label>
            </ToolbarItem>
            <ToolbarItem auto>
              <Select
                id="id_create_post_type"
                className="form-control"
                disabled={this.state.isLoading}
                onChange={this.onTypeChange}
                value={this.state.type.value}
                choices={this.types}
              />
            </ToolbarItem>

            <ToolbarItem auto>
              <input
                className="form-control"
                disabled={this.state.isLoading}
                onChange={this.onNoOfRoomChange}
                placeholder={"1"}
                type="number"
                value={this.state.no_of_room}
              />
            </ToolbarItem>
            <ToolbarItem shrink>
              <label >
                {pgettext("post thread", "Room(s)")}
              </label>
            </ToolbarItem>
          </ToolbarSection>


          <ToolbarSection auto>
            <ToolbarItem shrink>
              <label>
                {pgettext("post thread", "At")}
              </label>
            </ToolbarItem>
            <ToolbarItem auto>
              <input
                className="form-control"
                disabled={this.state.isLoading}
                onChange={this.onAtChange}
                placeholder={pgettext("post thread", "City")}
                type="text"
                value={this.state.at}
              />
            </ToolbarItem>
            <ToolbarItem shrink>
              <label>
                {pgettext("post thread", "Pay")}
              </label>
            </ToolbarItem>
            <ToolbarItem auto>
              <input
                className="form-control"
                disabled={this.state.isLoading}
                onChange={this.onRoomPayChange}
                placeholder={pgettext("post thread", "Share cost")}
                onFocus={this.onNumberFieldSelected}
                onBlur={this.onNumberFieldDeSelected}
                type="number"
                value={this.state.room_pay}
              />
            </ToolbarItem>
            <ToolbarItem shrink>
              <label>
                {pgettext("post thread", "A($)")}
              </label>
            </ToolbarItem>
          </ToolbarSection>

          <ToolbarSection auto>
            <ToolbarItem shrink>

              <label>
                {pgettext("post thread", "Start")}
              </label>
            </ToolbarItem>
            <ToolbarItem auto>
              <input
                className="form-control"
                disabled={this.state.isLoading}
                onChange={this.onStartChange}
                type="date"
                value={this.state.start}
              />
            </ToolbarItem>
            <ToolbarItem shrink>

              <label>
                {pgettext("post thread", "End")}
              </label>
            </ToolbarItem>
            <ToolbarItem auto>
              <input
                className="form-control"
                disabled={this.state.isLoading}
                onChange={this.onEndChange}
                type="date"
                value={this.state.end}
              />

            </ToolbarItem>
          </ToolbarSection> </div>
      case 4:
        return <div>
          <ToolbarSection auto>
            <ToolbarItem shrink>
              <label>
                {pgettext("post thread", "I'm")}
              </label>
            </ToolbarItem>
            <ToolbarItem auto>
              <Select
                id="id_create_post_type"
                className="form-control"
                disabled={this.state.isLoading}
                onChange={this.onTypeChange}
                value={this.state.type.value}
                choices={this.types}
              /></ToolbarItem>

            <ToolbarItem auto>
              <input
                className="form-control"
                disabled={this.state.isLoading}
                onChange={this.onNoOfseatsChange}
                placeholder={pgettext("post thread", "1")}
                type="number"
                value={this.state.no_of_seats}
              />
            </ToolbarItem>
            <ToolbarItem shrink>
              <label >
                {pgettext("post thread", "Seat(s)")}
              </label>
            </ToolbarItem>
          </ToolbarSection>


          <ToolbarSection auto>
            <ToolbarItem shrink>
              <label>
                {pgettext("post thread", "From")}
              </label>
            </ToolbarItem>
            <ToolbarItem auto>
              <input
                className="form-control"
                disabled={this.state.isLoading}
                onChange={this.onFromChange}
                placeholder={pgettext("post thread", "City")}
                type="text"
                value={this.state.from}
              />
            </ToolbarItem>

            <ToolbarItem shrink>
              <label>
                {pgettext("post thread", "To")}
              </label>
            </ToolbarItem>
            <ToolbarItem >
              <input
                className="form-control"
                disabled={this.state.isLoading}
                onChange={this.onToChange}
                placeholder={pgettext("post thread", "City")}
                type="text"
                value={this.state.to}
              />
            </ToolbarItem>
          </ToolbarSection>

          <ToolbarSection auto>
            <ToolbarItem shrink>

              <label>
                {pgettext("post thread", "Date")}
              </label>
            </ToolbarItem>
            <ToolbarItem auto>
              <input
                className="form-control"
                disabled={this.state.isLoading}
                onChange={this.onDateChange}
                placeholder={pgettext("post thread", "Date")}
                type="date"
                value={this.state.date}
              />
            </ToolbarItem>
            <ToolbarItem shrink>
              <label>
                {pgettext("post thread", "Pay")}
              </label>
            </ToolbarItem>
            <ToolbarItem>
              <input
                className="form-control"
                disabled={this.state.isLoading}
                onChange={this.onSeatsPayChange}
                placeholder={pgettext("post thread", "0")}
                onFocus={this.onNumberFieldSelected}
                onBlur={this.onNumberFieldDeSelected}
                type="number"
                value={this.state.seats_pay}
              />

            </ToolbarItem>
            <ToolbarItem shrink>
              <label>
                {pgettext("post thread", "A$")}
              </label>
            </ToolbarItem>
          </ToolbarSection> </div>
      default: return null
    }
  }

  renderToolBar = () => {

    const showOptions = !!(
      this.state.options.close ||
      this.state.options.hide ||
      this.state.options.pin
    )

    return <Toolbar className="posting-dialog-toolbar">
      <ToolbarSection className="posting-dialog-category-select" auto>
        <ToolbarItem shrink>
          <label>
            {pgettext("post thread", "On")}
          </label>
        </ToolbarItem>
        <ToolbarItem>
          <CategorySelect
            choices={this.state.categories}
            disabled={this.state.isLoading}
            onChange={this.onCategoryChange}
            value={this.state.category}
          />
        </ToolbarItem>
        {showOptions && (
          <ToolbarItem shrink>
            <PostingThreadOptions
              isClosed={this.state.close}
              isHidden={this.state.hide}
              isPinned={this.state.pin}
              disabled={this.state.isLoading}
              options={this.state.options}
              close={this.onClose}
              open={this.onOpen}
              hide={this.onHide}
              unhide={this.onUnhide}
              pinGlobally={this.onPinGlobally}
              pinLocally={this.onPinLocally}
              unpin={this.onUnpin}
            />
          </ToolbarItem>
        )}
      </ToolbarSection>
      {
        this.renderWidgetsCategory()
      }
      <ToolbarSection className="posting-dialog-thread-title" auto>
        <ToolbarItem auto>
          <label>
            {pgettext("post thread", "Thread title")}
          </label>
          <textarea
            className="form-control"
            disabled={this.state.isLoading}
            onChange={this.onTitleChange}
            placeholder={pgettext("post thread", "Thread title")}
            type="text"
            value={this.state.title}
          />
        </ToolbarItem>
      </ToolbarSection>
    </Toolbar>

  }
  clean() {

    if (this.state.category === 4) {
      if (!this.state.from.trim().length) {
        snackbar.error(pgettext("posting form", "Please provide where you start."))
        return false
      }
      if (!this.state.to.trim().length) {
        snackbar.error(pgettext("posting form", "Please provide your destination"))
        return false
      }
    } else if (this.state.category === 5) {
      if (!this.state.at.trim().length) {
        snackbar.error(pgettext("posting form", "Please provide which city."))
        return false
      }
    }

    if (!this.state.title.trim().length) {
      snackbar.error(
        pgettext("posting form", "Please provide thread title.")
      )
      return false
    }

    if (!this.state.post.trim().length) {
      snackbar.error(pgettext("posting form", "Please provide a message."))
      return false
    }

    const errors = this.validate()

    if (errors.title) {
      snackbar.error(errors.title[0])
      return false
    }

    if (errors.post) {
      snackbar.error(errors.post[0])
      return false
    }

    return true
  }

  send() {
    return ajax.post(this.props.submit, {
      title: this.state.title,
      category: this.state.category,
      post: this.state.post,
      attachments: attachments.clean(this.state.attachments),
      close: this.state.close,
      hide: this.state.hide,
      pin: this.state.pin,
    })
  }

  handleSuccess(success) {
    this.setState({ isLoading: true })
    this.close()

    snackbar.success(pgettext("post thread", "Your thread has been posted."))
    window.location = success.url
  }

  handleError(rejection) {
    if (rejection.status === 400) {
      const errors = [].concat(
        rejection.non_field_errors || [],
        rejection.category || [],
        rejection.title || [],
        rejection.post || [],
        rejection.attachments || []
      )

      snackbar.error(errors[0])
    } else {
      snackbar.apiError(rejection)
    }
  }

  render() {
    const dialogProps = {
      minimized: this.state.minimized,
      minimize: this.minimize,
      open: this.open,

      fullscreen: this.state.fullscreen,
      fullscreenEnter: this.fullscreenEnter,
      fullscreenExit: this.fullscreenExit,

      close: this.onCancel,
    }

    if (this.state.error) {
      return (
        <PostingDialogStart {...dialogProps}>
          <PostingDialogError message={this.state.error} close={this.close} />
        </PostingDialogStart>
      )
    }

    if (!this.state.isReady) {
      return (
        <PostingDialogStart {...dialogProps}>
          <div className="posting-loading ui-preview">
            <Toolbar className="posting-dialog-toolbar">
              <ToolbarSection className="posting-dialog-thread-title" auto>
                <ToolbarItem auto>
                  <input className="form-control" disabled={true} type="text" />
                </ToolbarItem>
              </ToolbarSection>
              <ToolbarSection className="posting-dialog-category-select" auto>
                <ToolbarItem>
                  <input className="form-control" disabled={true} type="text" />
                </ToolbarItem>
              </ToolbarSection>
            </Toolbar>

            <MarkupEditor
              attachments={[]}
              value={""}
              submitText={pgettext("post thread submit", "Start thread")}
              disabled={true}
              onAttachmentsChange={() => { }}
              onChange={() => { }}
            />
          </div>
        </PostingDialogStart>
      )
    }

    return (
      <PostingDialogStart {...dialogProps}>
        <form className="posting-dialog-form" onSubmit={this.handleSubmit}>
          {
            this.renderToolBar()
          }
          <MarkupEditor
            attachments={this.state.attachments}
            placeholder={"# Please add addiional information here \n Example: Please PM me or contact at 043211122x, Girls only, no pets, no smoking, no alcohol, etc."}
            value={this.state.post}
            submitText={pgettext("post thread submit", "Start thread")}
            disabled={this.state.isLoading}
            onAttachmentsChange={this.onAttachmentsChange}
            onChange={this.onPostChange}
          />
        </form>
      </PostingDialogStart >
    )
  }
}

const PostingDialogStart = ({
  children,
  close,
  minimized,
  minimize,
  open,
  fullscreen,
  fullscreenEnter,
  fullscreenExit,
}) => (
  <PostingDialog fullscreen={fullscreen} minimized={minimized}>
    <PostingDialogHeader
      fullscreen={fullscreen}
      fullscreenEnter={fullscreenEnter}
      fullscreenExit={fullscreenExit}
      minimized={minimized}
      minimize={minimize}
      open={open}
      close={close}
    >
      {pgettext("post thread", "Start new thread")}
    </PostingDialogHeader>
    <PostingDialogBody>{children}</PostingDialogBody>
  </PostingDialog>
)
