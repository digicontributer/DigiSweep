import React from 'react';
import {
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';


export default function ({ closeModal, derivitorStatus, gapLimit, progressModalOpen }) {
  return (
    <Modal
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={progressModalOpen}
      onClose={closeModal}
    >
      <div style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'relative', background: 'white', width: '95vh' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Wallet
              </TableCell>
              <TableCell>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { derivitorStatus.map(i => {
              return (
                <TableRow key={i.name}>
                  <TableCell>
                    {i.name}
                  </TableCell>
                  <TableCell>
                    [{i.status}/{gapLimit}]
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Modal>
  );
}